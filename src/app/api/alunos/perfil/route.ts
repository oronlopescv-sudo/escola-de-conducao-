export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  const s = await sessaoAtual();
  if (!s || s.role !== "ALUNO") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: s.userId },
    include: { user: { select: { nome: true, email: true } } },
  });
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });

  return NextResponse.json({
    id: s.userId,
    nome: aluno.user.nome,
    email: aluno.user.email,
    telefone: aluno.telefone || "",
    bi: aluno.documento || "",
    categoria: aluno.categoria,
    dataInscricao: aluno.dataInscricao,
  });
}

export async function PUT(req: Request) {
  const s = await sessaoAtual();
  if (!s || s.role !== "ALUNO") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  }

  const { nome, email, telefone, categoria } = await req.json();

  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });

  if (email) {
    const existente = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (existente && existente.id !== s.userId) {
      return NextResponse.json({ erro: "Já existe um utilizador com este email." }, { status: 409 });
    }
  }

  const [user, alunoAtualizado] = await Promise.all([
    prisma.user.update({
      where: { id: s.userId },
      data: {
        ...(nome ? { nome } : {}),
        ...(email ? { email: String(email).toLowerCase().trim() } : {}),
      },
      select: { nome: true, email: true },
    }),
    prisma.aluno.update({
      where: { userId: s.userId },
      data: {
        ...(telefone !== undefined ? { telefone } : {}),
        ...(categoria ? { categoria } : {}),
      },
    }),
  ]);

  return NextResponse.json({
    id: s.userId,
    nome: user.nome,
    email: user.email,
    telefone: alunoAtualizado.telefone || "",
    bi: alunoAtualizado.documento || "",
    categoria: alunoAtualizado.categoria,
    dataInscricao: alunoAtualizado.dataInscricao,
  });
}
