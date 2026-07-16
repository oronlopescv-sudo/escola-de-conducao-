import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MODULOS_BASE, QUESTOES_BASE } from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@autoescola.cv" },
    update: {},
    create: { nome: "Administrador", email: "admin@autoescola.cv", senha: hash, role: "ADMIN" },
  });

  const hashAluno = await bcrypt.hash("aluno123", 10);
  await prisma.user.upsert({
    where: { email: "aluno@autoescola.cv" },
    update: {},
    create: {
      nome: "Aluno Demonstração",
      email: "aluno@autoescola.cv",
      senha: hashAluno,
      role: "ALUNO",
      aluno: { create: { categoria: "B", telefone: "9XX XX XX" } },
    },
  });

  for (const m of MODULOS_BASE) {
    await prisma.modulo.upsert({
      where: { numero: m.numero },
      update: { titulo: m.titulo, descricao: m.descricao },
      create: m,
    });
  }

  const count = await prisma.questao.count();
  if (count === 0) {
    for (const q of QUESTOES_BASE) {
      const mod = await prisma.modulo.findUnique({ where: { numero: q.m } });
      await prisma.questao.create({
        data: {
          moduloId: mod?.id,
          enunciado: q.e,
          opcaoA: q.a,
          opcaoB: q.b,
          opcaoC: q.c,
          opcaoD: q.d,
          correta: q.ok,
          explicacao: q.x,
        },
      });
    }
  }

  console.log("Seed concluído.");
  console.log("Admin: admin@autoescola.cv / admin123");
  console.log("Aluno: aluno@autoescola.cv / aluno123");
}

main().finally(() => prisma.$disconnect());
