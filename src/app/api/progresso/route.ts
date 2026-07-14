export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

// Aluno marca módulo como concluído
export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const { moduloId } = await req.json();
  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
  const p = await prisma.moduloProgresso.upsert({
    where: { alunoId_moduloId: { alunoId: aluno.id, moduloId } },
    update: { concluido: true, concluidoEm: new Date() },
    create: { alunoId: aluno.id, moduloId, concluido: true, concluidoEm: new Date() },
  });
  return NextResponse.json(p);
}
