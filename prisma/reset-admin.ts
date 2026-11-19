import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdmin() {
  const passe = process.env.ADMIN_PASSWORD;
  if (!passe) {
    console.error("Définissez ADMIN_PASSWORD dans les variables d'environnement avant d'exécuter ce script.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(passe, 10);
  await prisma.user.upsert({
    where: { email: "admin@autoescola.cv" },
    update: { senha: hash },
    create: {
      nome: "Administrador",
      email: "admin@autoescola.cv",
      senha: hash,
      role: "ADMIN"
    },
  });
  console.log("✅ Mot de passe de l'administrateur renouvelé à partir d'ADMIN_PASSWORD.");
}

resetAdmin().catch(err => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
}).finally(() => prisma.$disconnect());
