import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { MODULOS_BASE, QUESTOES_BASE } from "@/lib/seed-data";

let verificado = false;

// Garantit que la base de données contient les 23 modules, la banque de questions et
// un utilisateur ADMIN, même si le seed n'a jamais été exécuté sur le serveur.
// S'exécute au maximum une fois par processus ; il est idempotent.
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
      const passe = process.env.ADMIN_PASSWORD;
      if (!passe) {
        console.warn("⚠️ Pas de compte ADMIN : définissez ADMIN_PASSWORD dans les variables d'environnement.");
      } else {
        const hash = await bcrypt.hash(passe, 10);
        await prisma.user.create({
          data: { nome: "Administrateur", email: "admin@autoescola.cv", senha: hash, role: "ADMIN" },
        });
        console.warn("✅ Compte ADMIN créé (mot de passe défini via ADMIN_PASSWORD).");
      }
    }
  } catch (e) {
    // Ne pas bloquer la requête si le seed échoue ; nouvelle tentative au prochain démarrage.
    verificado = false;
    console.error("Échec du bootstrap de la base de données :", e);
  }
}
