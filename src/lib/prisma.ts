import { PrismaClient } from "@prisma/client";

// Instanciação lazy: o client só é criado no primeiro uso, nunca no import.
// Evita falhas de build quando a base de dados não está acessível (ex: build no Easypanel).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient() as any;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
