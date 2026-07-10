export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  await prisma.questao.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
