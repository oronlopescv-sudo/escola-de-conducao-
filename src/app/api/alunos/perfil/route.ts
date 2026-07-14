import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  const s = await sessaoAtual();
  if (!s || s.role !== "ALUNO") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  // Mock data - simular perfil do aluno
  return NextResponse.json({
    id: s.userId,
    nome: "Aluno Demonstração",
    email: "aluno@autoescola.cv",
    telefone: "+238 9876543",
    bi: "00123456789",
    categoria: "B",
    dataInscricao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

export async function PUT(req: Request) {
  const s = await sessaoAtual();
  if (!s || s.role !== "ALUNO") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { nome, email, telefone, categoria } = await req.json();

  // Mock update - apenas retorna os dados atualizados
  return NextResponse.json({
    id: s.userId,
    nome: nome || "Aluno Demonstração",
    email: email || "aluno@autoescola.cv",
    telefone: telefone || "+238 9876543",
    bi: "00123456789",
    categoria: categoria || "B",
    dataInscricao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
}
