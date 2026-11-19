import { PrismaClient } from "@prisma/client";

// Constrói DATABASE_URL a partir das variáveis POSTGRES_* (quando uma base de
// dados PostgreSQL está ligada à app e as variáveis estão definidas) se
// DATABASE_URL não existir. Isto evita ter de configurar a connection string
// manualmente no painel.
function resolverDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.POSTGRES_HOST || process.env.DB_HOST;
  const port = process.env.POSTGRES_PORT || process.env.DB_PORT || "5432";
  const user = process.env.POSTGRES_USER || process.env.DB_USER;
  const pass = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD;
  const db = process.env.POSTGRES_DATABASE || process.env.DB_NAME || "ESCOLA";

  if (host && user && pass) {
    const url = `postgres://${user}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  return undefined;
}

resolverDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

export const prisma = globalForPrisma.prisma;