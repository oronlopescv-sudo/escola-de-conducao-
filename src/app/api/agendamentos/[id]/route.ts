export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

const STATUS_VALIDOS = ["Confirmado", "Cancelado", "Concluído"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const b = await req.json();
  if (b.status && !STATUS_VALIDOS.includes(b.status)) {
    return NextResponse.json({ erro: "Estado inválido." }, { status: 400 });
  }
  try {
    const atualizado = await prisma.agendamento.update({
      where: { id: params.id },
      data: {
        ...(b.status ? { status: b.status } : {}),
        ...(b.data ? { data: new Date(b.data) } : {}),
        ...(b.hora ? { hora: String(b.hora) } : {}),
        ...(b.local !== undefined ? { local: b.local || null } : {}),
        ...(b.instrutorNome !== undefined ? { instrutorNome: b.instrutorNome || null } : {}),
        ...(b.duracao ? { duracao: Number(b.duracao) } : {}),
        ...(b.tipo ? { tipo: b.tipo === "Prática" ? "Prática" : "Teórica" } : {}),
      },
    });
    return NextResponse.json(atualizado);
  } catch {
    return NextResponse.json({ erro: "Agendamento não encontrado." }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  try {
    await prisma.agendamento.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Agendamento não encontrado." }, { status: 404 });
  }
}
