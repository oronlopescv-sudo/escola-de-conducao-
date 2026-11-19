export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

type AgendamentoDb = {
  id: string;
  alunoId: string;
  tipo: string;
  data: Date;
  hora: string;
  duracao: number;
  local: string | null;
  instrutorNome: string | null;
  status: string;
  aluno: { user: { nome: string } };
};

function serializar(a: AgendamentoDb) {
  return {
    id: a.id,
    alunoId: a.alunoId,
    alunoNome: a.aluno.user.nome,
    tipo: a.tipo,
    data: a.data,
    hora: a.hora,
    duracao: a.duracao,
    local: a.local || "",
    instrutorNome: a.instrutorNome || "",
    status: a.status,
  };
}

export async function GET() {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });

  if (s.role === "ADMIN") {
    const todos = await prisma.agendamento.findMany({
      include: { aluno: { select: { user: { select: { nome: true } } } } },
      orderBy: [{ data: "asc" }, { hora: "asc" }],
    });
    return NextResponse.json(todos.map(serializar));
  }

  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json([]);
  const meus = await prisma.agendamento.findMany({
    where: { alunoId: aluno.id },
    include: { aluno: { select: { user: { select: { nome: true } } } } },
    orderBy: [{ data: "asc" }, { hora: "asc" }],
  });
  return NextResponse.json(meus.map(serializar));
}

export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Seul l'admin peut créer des rendez-vous" }, { status: 403 });
  }

  const b = await req.json();
  if (!b.alunoId || !b.data || !b.hora) {
    return NextResponse.json({ erro: "Élève, date et heure sont obligatoires." }, { status: 400 });
  }

  const aluno = await prisma.aluno.findUnique({ where: { id: b.alunoId } });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable." }, { status: 404 });

  const novo = await prisma.agendamento.create({
    data: {
      alunoId: b.alunoId,
      tipo: b.tipo === "Pratique" ? "Pratique" : "Théorique",
      data: new Date(b.data),
      hora: String(b.hora),
      duracao: Number(b.duracao) > 0 ? Number(b.duracao) : 60,
      local: b.local || null,
      instrutorNome: b.instrutorNome || null,
    },
    include: { aluno: { select: { user: { select: { nome: true } } } } },
  });
  return NextResponse.json(serializar(novo), { status: 201 });
}
