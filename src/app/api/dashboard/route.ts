export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

  if (s.role === "ADMIN") {
    const [totalAlunos, ativos, totalQuestoes, totalModulos, tentativas] = await Promise.all([
      prisma.aluno.count(),
      prisma.aluno.count({ where: { ativo: true } }),
      prisma.questao.count(),
      prisma.modulo.count(),
      prisma.tentativa.findMany({ orderBy: { criadaEm: "desc" }, take: 200 }),
    ]);
    const mediaAproveitamento =
      tentativas.length > 0
        ? Math.round((tentativas.reduce((a: number, t: { acertos: number; total: number }) => a + t.acertos / t.total, 0) / tentativas.length) * 100)
        : 0;
    const aprovariam = tentativas.filter((t: { acertos: number; total: number }) => t.acertos / t.total >= 0.8).length;
    const taxaAprovacao = tentativas.length ? Math.round((aprovariam / tentativas.length) * 100) : 0;
    return NextResponse.json({
      totalAlunos,
      ativos,
      totalQuestoes,
      totalModulos,
      totalTentativas: tentativas.length,
      mediaAproveitamento,
      taxaAprovacao,
    });
  }

  // Aluno
  const aluno = await prisma.aluno.findUnique({
    where: { userId: s.userId },
    include: {
      progresso: { where: { concluido: true } },
      tentativas: { orderBy: { criadaEm: "desc" }, take: 20 },
    },
  });
  const totalModulos = await prisma.modulo.count();
  if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
  const melhor = aluno.tentativas.reduce(
    (max: number, t: { acertos: number; total: number }) => Math.max(max, Math.round((t.acertos / t.total) * 100)),
    0
  );
  return NextResponse.json({
    categoria: aluno.categoria,
    modulosConcluidos: aluno.progresso.length,
    totalModulos,
    tentativas: aluno.tentativas.map((t: { id: string; criadaEm: Date; total: number; acertos: number }) => ({
      id: t.id,
      criadaEm: t.criadaEm,
      total: t.total,
      acertos: t.acertos,
    })),
    melhorResultado: melhor,
  });
}
