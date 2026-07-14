export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

  const modulos = await prisma.modulo.findMany({
    orderBy: { numero: "asc" },
    include: { _count: { select: { questoes: true } } },
  });

  if (s.role === "ALUNO") {
    const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
    const progresso = aluno
      ? await prisma.moduloProgresso.findMany({ where: { alunoId: aluno.id, concluido: true } })
      : [];
    const concluidos = new Set(progresso.map((p: { moduloId: string }) => p.moduloId));
    return NextResponse.json(modulos.map((m: { id: string }) => ({ ...m, concluido: concluidos.has(m.id) })));
  }
  return NextResponse.json(modulos);
}
