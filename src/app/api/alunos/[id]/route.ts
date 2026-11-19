export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { validarIdadeCategoria } from "@/lib/regras";
import type { Categoria } from "@prisma/client";
import { eGestor } from "@/lib/escola-scope";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { nome: true, email: true } },
      tentativas: { orderBy: { criadaEm: "desc" }, take: 10 },
      progresso: { where: { concluido: true } },
    },
  });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });
  return NextResponse.json(aluno);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object")
    return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });

  const atual = await prisma.aluno.findUnique({
    where: { id: params.id },
    select: { dataNascimento: true },
  });
  if (!atual) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });

  const CATEGORIAS = ["A", "B", "C", "D", "F", "A1", "B1", "C1", "D1", "BE", "CE", "DE"];
  if (b.categoria && !CATEGORIAS.includes(String(b.categoria)))
    return NextResponse.json({ erro: "Catégorie invalide." }, { status: 400 });

  let dataNascimento: Date | undefined;
  if (b.dataNascimento) {
    dataNascimento = new Date(b.dataNascimento);
    if (isNaN(dataNascimento.getTime()))
      return NextResponse.json({ erro: "Date de naissance invalide." }, { status: 400 });
  }

  // Re-validação da idade mínima com a categoria final (DL 4/2005, art. 122º)
  const categoriaFinal = b.categoria ? (String(b.categoria) as Categoria) : undefined;
  const dnFinal = dataNascimento ?? atual.dataNascimento;
  if (categoriaFinal && dnFinal) {
    const v = validarIdadeCategoria(dnFinal, categoriaFinal);
    if (!v.valido)
      return NextResponse.json(
        { erro: `L'âge minimal pour la catégorie ${categoriaFinal} est de ${v.minima} ans.` },
        { status: 400 }
      );
  }

  try {
    const aluno = await prisma.aluno.update({
      where: { id: params.id },
      data: {
        ...(b.telefone !== undefined ? { telefone: b.telefone } : {}),
        ...(b.morada !== undefined ? { morada: b.morada } : {}),
        ...(b.documento !== undefined ? { documento: b.documento } : {}),
        ...(categoriaFinal ? { categoria: categoriaFinal } : {}),
        ...(typeof b.ativo === "boolean" ? { ativo: b.ativo } : {}),
        ...(dataNascimento ? { dataNascimento } : {}),
        ...(b.nome ? { user: { update: { nome: b.nome } } } : {}),
      },
    });
    return NextResponse.json(aluno);
  } catch {
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s || !eGestor(s)) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const aluno = await prisma.aluno.findUnique({ where: { id: params.id } });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });
  await prisma.user.delete({ where: { id: aluno.userId } });
  return NextResponse.json({ ok: true });
}
