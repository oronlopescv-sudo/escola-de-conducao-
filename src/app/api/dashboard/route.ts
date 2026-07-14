import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookiesList = cookies();
  const token = cookiesList.get("token")?.value;
  console.log("🔍 Dashboard - Token presente:", !!token);

  const s = await sessaoAtual();
  if (!s) {
    console.log("❌ sessaoAtual() retornou null");
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  if (s.role === "ADMIN") {
    // Mock dashboard admin
    return NextResponse.json({
      totalAlunos: 45,
      ativos: 32,
      totalQuestoes: 500,
      totalModulos: 23,
      totalTentativas: 128,
      mediaAproveitamento: 72,
      taxaAprovacao: 68,
    });
  }

  // Mock dashboard aluno
  return NextResponse.json({
    categoria: "B",
    modulosConcluidos: 8,
    totalModulos: 23,
    melhorResultado: 78,
    tentativas: [
      { id: "t1", criadaEm: new Date().toISOString(), total: 50, acertos: 39 },
      { id: "t2", criadaEm: new Date(Date.now() - 86400000).toISOString(), total: 50, acertos: 35 },
      { id: "t3", criadaEm: new Date(Date.now() - 172800000).toISOString(), total: 50, acertos: 40 },
    ],
  });
}
