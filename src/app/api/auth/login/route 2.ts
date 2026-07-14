export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarToken } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  // Rate limit: 10 tentativas por IP a cada 15 minutos (anti brute-force)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { erro: "Demasiadas tentativas. Tente novamente em 15 minutos." },
      { status: 429 }
    );
  }

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

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Comparação sempre executada para tempo constante (evita enumeração por timing)
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
}
