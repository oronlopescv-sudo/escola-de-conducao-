export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  try {
    const s = await sessaoAtual();
    if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

    if (s.role === "ADMIN") {
      const [totalAlunos, ativos, totalQuestoes, totalModulos, tentativas] = await Promise.all([
        prisma.aluno.count(),
        prisma.aluno.count({ where: { ativo: true } }),
        prisma.questao.count(),
        prisma.modulo.count(),
        prisma.tentativa.findMany({ select: { total: true, acertos: true } }),
      ]);

      const totalTentativas = tentativas.length;
      const mediaAproveitamento =
        totalTentativas === 0
          ? 0
          : Math.round(
              (tentativas.reduce((soma, t) => soma + t.acertos / t.total, 0) / totalTentativas) * 100
            );
      const taxaAprovacao =
        totalTentativas === 0
          ? 0
          : Math.round(
              (tentativas.filter((t) => t.acertos / t.total >= 0.8).length / totalTentativas) * 100
            );

      return NextResponse.json({
        totalAlunos,
        ativos,
        totalQuestoes,
        totalModulos,
        totalTentativas,
        mediaAproveitamento,
        taxaAprovacao,
      });
    }

    // Dashboard do aluno
    const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
    if (!aluno) return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });

    const [totalModulos, modulosConcluidos, tentativas] = await Promise.all([
      prisma.modulo.count(),
      prisma.moduloProgresso.count({ where: { alunoId: aluno.id, concluido: true } }),
      prisma.tentativa.findMany({
        where: { alunoId: aluno.id },
        orderBy: { criadaEm: "desc" },
        select: { id: true, criadaEm: true, total: true, acertos: true },
      }),
    ]);

    const melhorResultado =
      tentativas.length === 0
        ? 0
        : Math.max(...tentativas.map((t) => Math.round((t.acertos / t.total) * 100)));

    return NextResponse.json({
      categoria: aluno.categoria,
      modulosConcluidos,
      totalModulos,
      melhorResultado,
      tentativas,
    });
  } catch (error: any) {
    console.error("❌ Dashboard erro:", error);
    return NextResponse.json({ erro: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
