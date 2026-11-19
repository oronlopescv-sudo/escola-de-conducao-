export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { eGestor } from "@/lib/escola-scope";

const STATUS_VALIDOS = ["Confirmé", "Annulé", "Terminé"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s || !eGestor(s)) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const b = await req.json();
  if (b.status && !STATUS_VALIDOS.includes(b.status)) {
    return NextResponse.json({ erro: "État invalide." }, { status: 400 });
  }
  const alvo = await prisma.agendamento.findUnique({
    where: { id: params.id },
    select: { escolaId: true },
  });
  if (!alvo || (s.role !== "SUPERADMIN" && alvo.escolaId !== s.escolaId)) {
    return NextResponse.json({ erro: "Rendez-vous introuvable." }, { status: 404 });
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
        ...(b.tipo ? { tipo: b.tipo === "Pratique" ? "Pratique" : "Théorique" } : {}),
      },
    });
    return NextResponse.json(atualizado);
  } catch {
    return NextResponse.json({ erro: "Rendez-vous introuvable." }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s || !eGestor(s)) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const alvo = await prisma.agendamento.findUnique({
    where: { id: params.id },
    select: { escolaId: true },
  });
  if (!alvo || (s.role !== "SUPERADMIN" && alvo.escolaId !== s.escolaId)) {
    return NextResponse.json({ erro: "Rendez-vous introuvable." }, { status: 404 });
  }
  try {
    await prisma.agendamento.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Rendez-vous introuvable." }, { status: 404 });
  }
}
