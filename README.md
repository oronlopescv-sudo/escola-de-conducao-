# AutoEscola CV

Plataforma de gestão para escola de condução em Cabo Verde. Painel administrativo + portal do aluno com vídeos e exercícios baseados no **Manual de Código de Estrada CV** e no **Decreto-Legislativo nº 4/2005**.

## Stack
Next.js 14 (App Router, TypeScript) · Prisma · PostgreSQL · JWT (cookie httpOnly) · Tailwind CSS

## Funcionalidades
**Admin:** painel de indicadores, gestão de alunos (com validação de idade mínima por categoria — art. 122º), gestão dos 23 módulos com vídeos YouTube, banco de questões.
**Aluno:** progresso na "estrada", módulos com vídeo + exercícios por módulo, simulado de 20 questões com correção automática e explicações, histórico de resultados (meta 80%).

## Arranque rápido (local)
```bash
cp .env.example .env        # editar DATABASE_URL e JWT_SECRET
npm install
npx prisma db push          # cria as tabelas
npm run db:seed             # 23 módulos + 40+ questões + contas demo
npm run dev
```
Contas demo: `admin@autoescola.cv / admin123` · `aluno@autoescola.cv / aluno123`
**Muda estas senhas em produção.**

## Deploy com Docker (VPS / Easypanel)
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "DB_PASSWORD=$(openssl rand -hex 16)" >> .env
docker compose up -d --build
# primeira vez: criar tabelas e seed
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts
```
No Easypanel: criar serviço PostgreSQL + serviço App apontando para este repositório (Dockerfile incluído), definindo `DATABASE_URL` e `JWT_SECRET`.

## Scripts
| comando | descrição |
|---|---|
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção (inclui prisma generate) |
| `npm run db:push` | sincronizar schema com a BD |
| `npm run db:seed` | popular módulos, questões e contas demo |
| `npm test` | testes das regras de negócio |

## Segurança
- JWT httpOnly, `sameSite=lax` (mitiga CSRF), `secure` em produção
- `JWT_SECRET` obrigatório em produção (falha cedo se ausente)
- Rate limiting no login (10 tentativas / 15 min por IP)
- Comparação bcrypt em tempo constante (anti user-enumeration)
- Autorização por role em todas as rotas API + middleware nas páginas
- O aluno nunca recebe a resposta correta antes de submeter
- Headers de segurança (X-Frame-Options, nosniff, Referrer-Policy)
- Prisma (queries parametrizadas) + validação de payloads

## Melhorias futuras
Gestão de instrutores/veículos/aulas/financeiro (spec completo), notificações SMS/WhatsApp, upload de documentos, relatórios PDF/Excel, rate limit com Redis para multi-instância.
