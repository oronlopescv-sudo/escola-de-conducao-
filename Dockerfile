# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app
# OpenSSL é necessário para o Prisma detetar a plataforma e usar o engine certo
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=app:app /app/node_modules/@prisma ./node_modules/@prisma
# CLI do Prisma para aplicar o schema no arranque (prisma db push)
COPY --from=builder --chown=app:app /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=app:app /app/prisma ./prisma
USER app
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# Sincroniza o schema com a base de dados antes de arrancar (cria tabelas novas,
# não apaga dados). Se falhar (ex.: DB ainda a arrancar), o servidor arranca na mesma.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js db push --skip-generate || echo 'AVISO: prisma db push falhou'; node server.js"]
