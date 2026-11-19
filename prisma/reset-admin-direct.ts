import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdminDirect() {
  const passe = process.env.ADMIN_PASSWORD;
  if (!passe) {
    console.error("Defina ADMIN_PASSWORD nas variáveis de ambiente antes de correr este script.");
    process.exit(1);
  }
  try {
    console.log("🔄 Conectando ao banco de dados...");

    const hash = await bcrypt.hash(passe, 10);
    console.log("🔐 Hash gerado:", hash);

    // Primeiro, verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@autoescola.cv" },
    });

    if (existingUser) {
      console.log("✏️ Atualizando usuário admin existente...");
      const updated = await prisma.user.update({
        where: { email: "admin@autoescola.cv" },
        data: { senha: hash },
      });
      console.log("✅ Admin atualizado com sucesso!");
      console.log("📧 Email:", updated.email);
      console.log("👤 Role:", updated.role);
    } else {
      console.log("➕ Criando novo usuário admin...");
      const created = await prisma.user.create({
        data: {
          nome: "Administrador",
          email: "admin@autoescola.cv",
          senha: hash,
          role: "ADMIN",
        },
      });
      console.log("✅ Admin criado com sucesso!");
      console.log("📧 Email:", created.email);
      console.log("👤 Role:", created.role);
    }

    console.log("\n✔️ Tudo pronto! Palavra-passe renovada a partir de ADMIN_PASSWORD.");

  } catch (error: any) {
    console.error("❌ ERRO:", error.message);
    if (error.code === "P1002") {
      console.error("   → Banco de dados não está acessível");
    } else if (error.code === "P2021") {
      console.error("   → Tabela 'User' não existe. Execute: npm run db:push");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminDirect();
