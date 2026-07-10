export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const modulo = await prisma.modulo.findUnique({
    where: { id: params.id },
    include: { questoes: true },
  });
  if (!modulo) return NextResponse.json({ erro: "Módulo não encontrado" }, { status: 404 });

  let concluido = false;
  if (s.role === "ALUNO") {
    const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
    if (aluno) {
      const p = await prisma.moduloProgresso.findUnique({
        where: { alunoId_moduloId: { alunoId: aluno.id, moduloId: modulo.id } },
      });
      concluido = !!p?.concluido;
    }
  }
  // Aluno não recebe a resposta correta antes de responder
  const questoes =
    s.role === "ALUNO"
      ? modulo.questoes.map(({ correta, explicacao, ...q }: { correta: string; explicacao: string | null; [k: string]: unknown }) => q)
      : modulo.questoes;
  return NextResponse.json({ ...modulo, questoes, concluido });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const b = await req.json();
  const modulo = await prisma.modulo.update({
    where: { id: params.id },
    data: { titulo: b.titulo, descricao: b.descricao, videoUrl: b.videoUrl },
  });
  return NextResponse.json(modulo);
}
