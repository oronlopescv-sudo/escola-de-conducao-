export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { eGestor } from "@/lib/escola-scope";

export async function GET() {
  const s = await sessaoAtual();
  if (!s || !eGestor(s)) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const questoes = await prisma.questao.findMany({
    include: { modulo: { select: { numero: true, titulo: true } } },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(questoes);
}

export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (!s || !eGestor(s)) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object")
    return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });
  const VALIDAS = ["A", "B", "C", "D"];
  if (!b.enunciado || !b.opcaoA || !b.opcaoB || !VALIDAS.includes(b.correta))
    return NextResponse.json({ erro: "Énoncé, options A/B et réponse correcte (A–D) sont obligatoires." }, { status: 400 });
  if (b.correta === "C" && !b.opcaoC)
    return NextResponse.json({ erro: "L'option C est obligatoire quand la réponse correcte est C." }, { status: 400 });
  if (b.correta === "D" && !b.opcaoD)
    return NextResponse.json({ erro: "L'option D est obligatoire quand la réponse correcte est D." }, { status: 400 });
  try {
    if (b.moduloId) {
      const m = await prisma.modulo.findUnique({ where: { id: String(b.moduloId) }, select: { id: true } });
      if (!m) return NextResponse.json({ erro: "Module introuvable" }, { status: 400 });
    }
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
  } catch {
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}
