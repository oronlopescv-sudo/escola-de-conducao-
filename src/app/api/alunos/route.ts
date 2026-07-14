export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { validarIdadeCategoria } from "@/lib/regras";

export async function GET() {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const alunos = await prisma.aluno.findMany({
    include: {
      user: { select: { nome: true, email: true } },
      _count: { select: { tentativas: true, progresso: { where: { concluido: true } } } },
    },
    orderBy: { dataInscricao: "desc" },
  });
  return NextResponse.json(alunos);
}

export async function POST(req: Request) {
  const s = await sessaoAtual();
  if (s?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });
  const b = await req.json();
  if (!b.nome || !b.email || !b.senha)
    return NextResponse.json({ erro: "Nome, email e palavra-passe são obrigatórios." }, { status: 400 });

  const existe = await prisma.user.findUnique({ where: { email: b.email } });
  if (existe) return NextResponse.json({ erro: "Já existe um utilizador com este email." }, { status: 409 });

  // Validação de idade mínima (DL 4/2005, art. 122º)
  if (b.dataNascimento && b.categoria) {
    const v = validarIdadeCategoria(new Date(b.dataNascimento), b.categoria);
    if (!v.valido)
      return NextResponse.json(
        { erro: `Idade mínima para a categoria ${b.categoria} é ${v.minima} anos (o aluno tem ${v.idade}).` },
        { status: 400 }
      );
  }

  const hash = await bcrypt.hash(b.senha, 10);
  const user = await prisma.user.create({
    data: {
      nome: b.nome,
      email: b.email,
      senha: hash,
      role: "ALUNO",
      aluno: {
        create: {
          telefone: b.telefone || null,
          morada: b.morada || null,
          documento: b.documento || null,
          categoria: b.categoria || "B",
          dataNascimento: b.dataNascimento ? new Date(b.dataNascimento) : null,
        },
      },
    },
    include: { aluno: true },
  });
  return NextResponse.json(user.aluno, { status: 201 });
}
