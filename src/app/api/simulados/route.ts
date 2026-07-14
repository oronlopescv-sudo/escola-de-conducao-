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

// GET: gera um simulado (questões aleatórias sem a resposta)
export async function GET(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const url = new URL(req.url);
  const n = Math.min(parseInt(url.searchParams.get("n") || "20"), 40);
  const todas: QuestaoRow[] = await prisma.questao.findMany();
  const baralhadas = todas.sort(() => Math.random() - 0.5).slice(0, n);
  return NextResponse.json(
    baralhadas.map(({ correta, explicacao, ...q }: QuestaoRow) => q)
  );
}

// POST: submete respostas e devolve correção
export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ALUNO") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });

  let payload: { respostas?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }
  const respostas = payload.respostas;
  if (
    !Array.isArray(respostas) ||
    respostas.length === 0 ||
    respostas.length > 60 ||
    !respostas.every(
      (r: any) =>
        r && typeof r.questaoId === "string" && typeof r.resposta === "string" && r.resposta.length <= 1
    )
  ) {
    return NextResponse.json({ erro: "Formato de respostas inválido." }, { status: 400 });
  }
  const ids = respostas.map((r: { questaoId: string }) => r.questaoId);
  const questoes: QuestaoRow[] = await prisma.questao.findMany({ where: { id: { in: ids } } });
  const mapa = new Map<string, QuestaoRow>(questoes.map((q) => [q.id, q]));

  const detalhes = respostas.map((r: { questaoId: string; resposta: string }) => {
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
    data: { alunoId: aluno.id, total: respostas.length, acertos, detalhes },
  });

  return NextResponse.json({ tentativaId: tentativa.id, total: respostas.length, acertos, detalhes });
}
