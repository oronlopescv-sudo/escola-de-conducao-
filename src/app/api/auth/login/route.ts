import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    // Mock users
    const validUsers: Record<string, string> = {
      "admin@autoescola.cv": "admin123",
      "aluno@autoescola.cv": "aluno123",
    };

    const password = validUsers[email];
    if (!password || password !== senha) {
      return NextResponse.json(
        { erro: "Email ou palavra-passe incorretos." },
        { status: 401 }
      );
    }

    // Create response
    const role = email === "admin@autoescola.cv" ? "ADMIN" : "ALUNO";
    const res = NextResponse.json({ role, success: true });

    // Set auth cookie (mock token)
    res.cookies.set("token", "mock-token-" + email, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { erro: error.message || "Erro" },
      { status: 500 }
    );
  }
}
