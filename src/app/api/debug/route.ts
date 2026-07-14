import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    message: "Debug endpoint - POST to /api/auth/login with demo credentials",
    demoAccounts: [
      { email: "admin@autoescola.cv", senha: "admin123", role: "ADMIN" },
      { email: "aluno@autoescola.cv", senha: "aluno123", role: "ALUNO" }
    ]
  });
}
