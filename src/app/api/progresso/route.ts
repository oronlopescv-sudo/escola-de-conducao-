export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

// L'élève marque le module comme terminé
export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const { moduloId } = await req.json();
  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });
  const p = await prisma.moduloProgresso.upsert({
    where: { alunoId_moduloId: { alunoId: aluno.id, moduloId } },
    update: { concluido: true, concluidoEm: new Date() },
    create: { alunoId: aluno.id, moduloId, concluido: true, concluidoEm: new Date() },
  });
  return NextResponse.json(p);
}
