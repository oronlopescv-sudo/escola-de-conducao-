import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { MODULOS_BASE, QUESTOES_BASE } from "@/lib/seed-data";

let verificado = false;

// Garante que a base de dados tem os 23 módulos, o banco de questões e um
// utilizador ADMIN, mesmo que o seed nunca tenha sido executado no servidor.
// Corre no máximo uma vez por processo; é idempotente.
export async function garantirDadosBase(): Promise<void> {
  if (verificado) return;
  verificado = true;

  try {
    const totalModulos = await prisma.modulo.count();
    if (totalModulos === 0) {
      for (const m of MODULOS_BASE) {
        await prisma.modulo.upsert({
          where: { numero: m.numero },
          update: { titulo: m.titulo, descricao: m.descricao },
          create: m,
        });
      }
    }

    const totalQuestoes = await prisma.questao.count();
    if (totalQuestoes === 0) {
      const modulos = await prisma.modulo.findMany({ select: { id: true, numero: true } });
      const porNumero = new Map(modulos.map((m) => [m.numero, m.id]));
      for (const q of QUESTOES_BASE) {
        await prisma.questao.create({
          data: {
            moduloId: porNumero.get(q.m) || null,
            enunciado: q.e,
            opcaoA: q.a,
            opcaoB: q.b,
            opcaoC: q.c || null,
            opcaoD: q.d || null,
            correta: q.ok,
            explicacao: q.x || null,
          },
        });
      }
    }

    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (totalAdmins === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: { nome: "Administrador", email: "admin@autoescola.cv", senha: hash, role: "ADMIN" },
      });
      console.warn("⚠️ Conta ADMIN criada (admin@autoescola.cv / admin123). Altere a palavra-passe.");
    }
  } catch (e) {
    // Não bloquear o pedido se o seed falhar; tenta novamente no próximo arranque.
    verificado = false;
    console.error("Bootstrap da base de dados falhou:", e);
  }
}
