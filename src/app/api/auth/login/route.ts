export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarToken } from "@/lib/auth";
import { garantirDadosBase } from "@/lib/bootstrap";

export async function POST(req: Request) {
  // NOTA: o limitador de tentativas (rate-limit) foi removido a pedido do
  // responsável, pois estava a bloquear utilizações legítimas. Se no futuro
  // houver tentativas de brute-force, reativar com um limite generoso.

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

  try {
    await garantirDadosBase();
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { aluno: { select: { ativo: true } } },
    });
    // Comparação sempre executada para tempo constante (evita enumeração por timing)
    const hashDummy = "$2a$10$C6UzMDM.H6dfI/f/IKcEeO7ZKo8dY1vJ0f0eYhN0y1yQdCkq2eD2a";
    const ok = await bcrypt.compare(senha, user?.senha || hashDummy);
    if (!user || !ok) {
      return NextResponse.json({ erro: "Email ou palavra-passe incorretos." }, { status: 401 });
    }
    if (user.role === "ALUNO" && user.aluno && !user.aluno.ativo) {
      return NextResponse.json({ erro: "Conta desativada. Contacte a escola." }, { status: 403 });
    }

    const token = await criarToken({ userId: user.id, role: user.role, nome: user.nome });
    const res = NextResponse.json({ role: user.role, success: true });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ erro: "Erro no servidor" }, { status: 500 });
  }
}
