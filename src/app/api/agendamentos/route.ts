import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/auth";

// Mock data
const agendamentos = [
  {
    id: "agd-001",
    alunoId: "aluno-001",
    alunoNome: "Aluno Demonstração",
    tipo: "Teórica",
    data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias
    hora: "09:00",
    duracao: 90,
    local: "Sala de Aula - Praia",
    instrutorNome: "João Silva",
    status: "Confirmado",
  },
  {
    id: "agd-002",
    alunoId: "aluno-001",
    alunoNome: "Aluno Demonstração",
    tipo: "Prática",
    data: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias
    hora: "14:00",
    duracao: 60,
    local: "Circuito Fechado - Santa Maria",
    instrutorNome: "Maria Costa",
    status: "Confirmado",
  },
];

export async function GET() {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

  if (s.role === "ADMIN") {
    return NextResponse.json(agendamentos);
  }

  // Aluno vê apenas seus agendamentos
  const meusAgendamentos = agendamentos.filter((a) => a.alunoId === s.userId);
  return NextResponse.json(meusAgendamentos);
}

export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Apenas admin pode criar agendamentos" }, { status: 403 });
  }

  const { alunoId, alunoNome, tipo, data, hora, duracao, local, instrutorNome } = await req.json();

  const novo = {
    id: `agd-${Date.now()}`,
    alunoId,
    alunoNome,
    tipo,
    data,
    hora,
    duracao,
    local,
    instrutorNome,
    status: "Confirmado",
  };

  agendamentos.push(novo);
  return NextResponse.json(novo, { status: 201 });
}
