import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdmin() {
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@autoescola.cv" },
    update: { senha: hash },
    create: {
      nome: "Administrador",
      email: "admin@autoescola.cv",
      senha: hash,
      role: "ADMIN"
    },
  });
  console.log("✅ Admin configurado com sucesso!");
  console.log("Email: admin@autoescola.cv");
  console.log("Senha: admin123");
}

resetAdmin().catch(err => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
}).finally(() => prisma.$disconnect());
