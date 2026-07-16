import { PrismaClient } from "@prisma/client";

// Constrói DATABASE_URL a partir das variáveis MYSQL_* (injetadas pelo EasyPanel
// quando uma base de dados MySQL está ligada à app) se DATABASE_URL não existir.
// Isto evita ter de configurar a connection string manualmente no painel.
function resolverDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.MYSQL_HOST || process.env.DB_HOST;
  const port = process.env.MYSQL_PORT || process.env.DB_PORT || "3306";
  const user = process.env.MYSQL_USER || process.env.DB_USER;
  const pass = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
  const db = process.env.MYSQL_DATABASE || process.env.DB_NAME || "ESCOLA";

  if (host && user && pass) {
    const url = `mysql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
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