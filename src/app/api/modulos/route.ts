export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function GET() {
  try {
    const s = await sessaoAtual();
    if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

    const modulos = await prisma.modulo.findMany({
      orderBy: { numero: "asc" },
      include: { _count: { select: { questoes: true } } },
    });

    if (s.role === "ALUNO") {
      const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
      const concluidosIds = aluno
        ? (
            await prisma.moduloProgresso.findMany({
              where: { alunoId: aluno.id, concluido: true },
              select: { moduloId: true },
            })
          ).map((p) => p.moduloId)
        : [];
      const concluidos = new Set(concluidosIds);
      return NextResponse.json(
        modulos.map((m) => ({ ...m, concluido: concluidos.has(m.id) }))
      );
    }

    return NextResponse.json(modulos);
  } catch (error: any) {
    console.error("❌ Módulos erro:", error);
    return NextResponse.json({ erro: "Erro ao carregar módulos" }, { status: 500 });
  }
}
