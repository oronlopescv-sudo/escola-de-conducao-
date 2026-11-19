export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

// L'élève marque le module comme terminé
export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const { moduloId } = body as { moduloId?: unknown };
  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });
  if (typeof moduloId !== "string" || !moduloId)
    return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });
  const modulo = await prisma.modulo.findUnique({ where: { id: moduloId }, select: { id: true } });
  if (!modulo) return NextResponse.json({ erro: "Module introuvable" }, { status: 400 });
  try {
    const p = await prisma.moduloProgresso.upsert({
      where: { alunoId_moduloId: { alunoId: aluno.id, moduloId } },
      update: { concluido: true, concluidoEm: new Date() },
      create: { alunoId: aluno.id, moduloId, concluido: true, concluidoEm: new Date() },
    });
    return NextResponse.json(p);
  } catch {
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}
