import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-mudar"
);

// Demo users (hardcoded for now)
const DEMO_USERS = [
  {
    id: "admin-001",
    email: "admin@autoescola.cv",
    nome: "Administrador",
    senha: "$2a$10$8M8RR7aSI0LVLsXsKJN.Ue2XW1oJjGK3NmR8vJK8Z9Z9Z9Z9Z9Z9",
    role: "ADMIN",
  },
  {
    id: "aluno-001",
    email: "aluno@autoescola.cv",
    nome: "Aluno Demonstração",
    senha: "$2a$10$8M8RR7aSI0LVLsXsKJN.Ue2XW1oJjGK3NmR8vJK8Z9Z9Z9Z9Z9Z9",
    role: "ALUNO",
  },
];

export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { erro: "Email e palavra-passe são obrigatórios." },
        { status: 400 }
      );
    }

    const user = DEMO_USERS.find(
      (u) => u.email === email.toLowerCase().trim()
    );

    if (!user) {
      return NextResponse.json(
        { erro: "Email ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);
    if (!passwordMatch) {
      return NextResponse.json(
        { erro: "Email ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
      nome: user.nome,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

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
    return NextResponse.json(
      { erro: "Erro no servidor" },
      { status: 500 }
    );
  }
}
