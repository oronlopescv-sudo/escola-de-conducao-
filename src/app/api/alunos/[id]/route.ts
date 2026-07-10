export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { nome: true, email: true } },
      tentativas: { orderBy: { criadaEm: "desc" }, take: 10 },
      progresso: { where: { concluido: true } },
    },
  });
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
  return NextResponse.json(aluno);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const b = await req.json();
  const aluno = await prisma.aluno.update({
    where: { id: params.id },
    data: {
      telefone: b.telefone,
      morada: b.morada,
      documento: b.documento,
      categoria: b.categoria,
      ativo: b.ativo,
      dataNascimento: b.dataNascimento ? new Date(b.dataNascimento) : undefined,
      user: b.nome ? { update: { nome: b.nome } } : undefined,
    },
  });
  return NextResponse.json(aluno);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const aluno = await prisma.aluno.findUnique({ where: { id: params.id } });
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
  await prisma.user.delete({ where: { id: aluno.userId } });
  return NextResponse.json({ ok: true });
}
