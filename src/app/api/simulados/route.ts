export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

type QuestaoRow = {
  id: string;
  enunciado: string;
  opcaoA: string;
  opcaoB: string;
  opcaoC: string | null;
  opcaoD: string | null;
  correta: string;
  explicacao: string | null;
  moduloId: string | null;
};

// GET : génère un examen blanc (questions aléatoires sans la réponse)
export async function GET(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const url = new URL(req.url);
  const raw = parseInt(url.searchParams.get("n") || "20", 10);
  const n = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), 40) : 20;
  const todas: QuestaoRow[] = await prisma.questao.findMany();
  const baralhadas = todas.sort(() => Math.random() - 0.5).slice(0, n);
  return NextResponse.json(
    baralhadas.map(({ correta, explicacao, ...q }: QuestaoRow) => q)
  );
}

// POST : soumet les réponses et renvoie la correction
export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });

  let payload: { respostas?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });
  }
  const respostas = payload.respostas;
  if (
    !Array.isArray(respostas) ||
    respostas.length === 0 ||
    respostas.length > 60 ||
    !respostas.every(
      (r: any) =>
        r &&
        typeof r.questaoId === "string" &&
        typeof r.resposta === "string" &&
        r.resposta.length === 1 &&
        ["A", "B", "C", "D"].includes(r.resposta)
    )
  ) {
    return NextResponse.json({ erro: "Format des réponses invalide." }, { status: 400 });
  }
  // Uma única resposta por questão e ids existentes na BD
  const vistas = new Set<string>();
  const validas = (respostas as Array<{ questaoId: string; resposta: string }>).filter((r) => {
    if (vistas.has(r.questaoId)) return false;
    vistas.add(r.questaoId);
    return true;
  });
  const ids = validas.map((r) => r.questaoId);
  const questoes: QuestaoRow[] = await prisma.questao.findMany({ where: { id: { in: ids } } });
  const mapa = new Map<string, QuestaoRow>(questoes.map((q) => [q.id, q]));

  const detalhes = validas.map((r) => {
    const q = mapa.get(r.questaoId);
    return {
      questaoId: r.questaoId,
      resposta: r.resposta,
      correta: q?.correta || "",
      acertou: q?.correta === r.resposta,
      explicacao: q?.explicacao || null,
    };
  });
  const acertos = detalhes.filter((d) => d.acertou).length;

  const tentativa = await prisma.tentativa.create({
    data: { alunoId: aluno.id, total: validas.length, acertos, detalhes },
  });

  return NextResponse.json({ tentativaId: tentativa.id, total: validas.length, acertos, detalhes });
}
