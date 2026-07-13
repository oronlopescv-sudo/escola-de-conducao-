import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdmin() {
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.update({
    where: { email: "admin@autoescola.cv" },
    data: { senha: hash },
  });
  console.log("✅ Senha de admin resetada para: admin123");
  console.log("Email:", admin.email);
}

resetAdmin().finally(() => prisma.$disconnect());
