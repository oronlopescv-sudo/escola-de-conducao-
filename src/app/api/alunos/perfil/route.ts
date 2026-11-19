export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { validarIdadeCategoria } from "@/lib/regras";
import type { Categoria } from "@prisma/client";

export async function GET() {
  const s = await sessaoAtual();
  if (!s || s.role !== "ALUNO") {
    return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  }

  const aluno = await prisma.aluno.findUnique({
    where: { userId: s.userId },
    include: { user: { select: { nome: true, email: true } } },
  });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });

  return NextResponse.json({
    id: s.userId,
    nome: aluno.user.nome,
    email: aluno.user.email,
    telefone: aluno.telefone || "",
    bi: aluno.documento || "",
    categoria: aluno.categoria,
    dataInscricao: aluno.dataInscricao,
  });
}

export async function PUT(req: Request) {
  const s = await sessaoAtual();
  if (!s || s.role !== "ALUNO") {
    return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  }

  const { nome, email, telefone, categoria } = await req.json();

  const aluno = await prisma.aluno.findUnique({ where: { userId: s.userId } });
  if (!aluno) return NextResponse.json({ erro: "Élève introuvable" }, { status: 404 });

  const CATEGORIAS = ["A", "B", "C", "D", "F", "A1", "B1", "C1", "D1", "BE", "CE", "DE"];
  let novaCategoria: Categoria | null = null;
  if (categoria) {
    if (!CATEGORIAS.includes(String(categoria)))
      return NextResponse.json({ erro: "Catégorie invalide." }, { status: 400 });
    novaCategoria = String(categoria) as Categoria;
    // Re-validação da idade mínima (DL 4/2005, art. 122º)
    if (novaCategoria !== null && novaCategoria !== aluno.categoria && aluno.dataNascimento) {
      const v = validarIdadeCategoria(aluno.dataNascimento, novaCategoria);
      if (!v.valido)
        return NextResponse.json(
          { erro: `L'âge minimal pour la catégorie ${novaCategoria} est de ${v.minima} ans.` },
          { status: 400 }
        );
    }
  }

  if (email) {
    const existente = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (existente && existente.id !== s.userId) {
      return NextResponse.json({ erro: "Un utilisateur avec cet e-mail existe déjà." }, { status: 409 });
    }
  }

  try {
    const [user, alunoAtualizado] = await Promise.all([
      prisma.user.update({
        where: { id: s.userId },
        data: {
          ...(nome ? { nome } : {}),
          ...(email ? { email: String(email).toLowerCase().trim() } : {}),
        },
        select: { nome: true, email: true },
      }),
      prisma.aluno.update({
        where: { userId: s.userId },
        data: {
          ...(telefone !== undefined ? { telefone } : {}),
          ...(novaCategoria ? { categoria: novaCategoria } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      id: s.userId,
      nome: user.nome,
      email: user.email,
      telefone: alunoAtualizado.telefone || "",
      bi: alunoAtualizado.documento || "",
      categoria: alunoAtualizado.categoria,
      dataInscricao: alunoAtualizado.dataInscricao,
    });
  } catch {
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}
