export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const questoes = await prisma.questao.findMany({
    include: { modulo: { select: { numero: true, titulo: true } } },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(questoes);
}

export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const b = await req.json();
  if (!b.enunciado || !b.opcaoA || !b.opcaoB || !b.correta)
    return NextResponse.json({ erro: "Énoncé, options A/B et réponse correcte sont obligatoires." }, { status: 400 });
  const q = await prisma.questao.create({
    data: {
      enunciado: b.enunciado,
      opcaoA: b.opcaoA,
      opcaoB: b.opcaoB,
      opcaoC: b.opcaoC || null,
      opcaoD: b.opcaoD || null,
      correta: b.correta,
      explicacao: b.explicacao || null,
      moduloId: b.moduloId || null,
    },
  });
  return NextResponse.json(q, { status: 201 });
}
