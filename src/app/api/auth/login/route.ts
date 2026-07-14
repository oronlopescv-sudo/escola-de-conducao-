export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    let body: { email?: string; senha?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
    }
    const { email, senha } = body;
    if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
      return NextResponse.json({ erro: "Email e palavra-passe são obrigatórios." }, { status: 400 });
    }

    console.log(`🔐 Login: ${email}`);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    console.log(`✓ User: ${user ? 'found' : 'not found'}`);

    const hashDummy = "$2a$10$C6UzMDM.H6dfI/f/IKcEeO7ZKo8dY1vJ0f0eYhN0y1yQdCkq2eD2a";
    const ok = await bcrypt.compare(senha, user?.senha || hashDummy);

    if (!user || !ok) {
      return NextResponse.json({ erro: "Email ou palavra-passe incorretos." }, { status: 401 });
    }

    const token = await criarToken({ userId: user.id, role: user.role, nome: user.nome });
    const res = NextResponse.json({ role: user.role });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ erro: error.message || "Erro no servidor" }, { status: 500 });
  }
}
