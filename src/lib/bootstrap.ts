import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { MODULOS_BASE, QUESTOES_BASE } from "@/lib/seed-data";

let verificado = false;

// Garantit que la base contient les 23 modules, la banque de questions, l'école
// par défaut, le rattachement des données et un SUPERADMIN. Idempotent.
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

    // École par défaut (l'espace de la plateforme)
    let cv = await prisma.escola.findUnique({ where: { slug: "cv" } });
    if (!cv) {
      cv = await prisma.escola.create({
        data: { nome: "Auto-École CV", slug: "cv", email: "contact@autoescola.cv", ativo: true },
      });
    }

    // Rattachement des données existantes à l'école par défaut
    await prisma.aluno.updateMany({ where: { escolaId: null }, data: { escolaId: cv.id } });
    await prisma.agendamento.updateMany({ where: { escolaId: null }, data: { escolaId: cv.id } });
    await prisma.tentativa.updateMany({ where: { escolaId: null }, data: { escolaId: cv.id } });

    const totalSuper = await prisma.user.count({ where: { role: "SUPERADMIN" } });
    const passe = process.env.ADMIN_PASSWORD;
    if (totalSuper === 0) {
      if (!passe) {
        console.warn("⚠️ Pas de SUPERADMIN : définissez ADMIN_PASSWORD dans les variables d'environnement.");
      } else {
        const admin = await prisma.user.findUnique({ where: { email: "admin@autoescola.cv" } });
        if (admin && admin.role !== "SUPERADMIN") {
          // Le compte admin existant devient le gestionnaire de la plateforme
          await prisma.user.update({ where: { id: admin.id }, data: { role: "SUPERADMIN", escolaId: null } });
          console.warn("✅ Le compte admin existant est maintenant SUPERADMIN.");
        } else if (!admin) {
          const hash = await bcrypt.hash(passe, 10);
          await prisma.user.create({
            data: { nome: "Administrateur", email: "admin@autoescola.cv", senha: hash, role: "SUPERADMIN" },
          });
          console.warn("✅ Compte SUPERADMIN créé (mot de passe défini via ADMIN_PASSWORD).");
        }
      }
    }
  } catch (e) {
    // Ne pas bloquer la requête si le seed échoue ; nouvelle tentative au prochain démarrage.
    verificado = false;
    console.error("Échec du bootstrap de la base de données :", e);
  }
}
