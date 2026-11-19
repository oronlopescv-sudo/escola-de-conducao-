import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdminDirect() {
  const passe = process.env.ADMIN_PASSWORD;
  if (!passe) {
    console.error("Définissez ADMIN_PASSWORD dans les variables d'environnement avant d'exécuter ce script.");
    process.exit(1);
  }
  try {
    console.log("🔄 Connexion à la base de données...");

    const hash = await bcrypt.hash(passe, 10);
    console.log("🔐 Hachage généré :", hash);

    // Primeiro, verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@autoescola.cv" },
    });

    if (existingUser) {
      console.log("✏️ Mise à jour du compte administrateur existant...");
      const updated = await prisma.user.update({
        where: { email: "admin@autoescola.cv" },
        data: { senha: hash },
      });
      console.log("✅ Compte administrateur mis à jour !");
      console.log("📧 E-mail :", updated.email);
      console.log("👤 Rôle :", updated.role);
    } else {
      console.log("➕ Création du compte administrateur...");
      const created = await prisma.user.create({
        data: {
          nome: "Administrador",
          email: "admin@autoescola.cv",
          senha: hash,
          role: "ADMIN",
        },
      });
      console.log("✅ Compte administrateur créé !");
      console.log("📧 Email:", created.email);
      console.log("👤 Role:", created.role);
    }

    console.log("\n✔️ Tudo pronto! Palavra-passe renovada a partir de ADMIN_PASSWORD.");

  } catch (error: any) {
    console.error("❌ ERREUR :", error.message);
    if (error.code === "P1002") {
      console.error("   → La base de données n'est pas accessible");
    } else if (error.code === "P2021") {
      console.error("   → La table 'User' n'existe pas. Exécutez : npm run db:push");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminDirect();
