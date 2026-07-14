import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed: Banco de dados vazio - populado via Admin.");
}

main().finally(() => prisma.$disconnect());
