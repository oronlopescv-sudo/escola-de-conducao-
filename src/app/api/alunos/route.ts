export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { validarIdadeCategoria } from "@/lib/regras";

// Palavra-passe legível, sem caracteres ambíguos (0/O, 1/I/l)
function gerarSenha(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[crypto.randomInt(chars.length)];
  return s;
}

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
  if (!b.nome || !b.email)
    return NextResponse.json({ erro: "Nome e email são obrigatórios." }, { status: 400 });

  const email = String(b.email).toLowerCase().trim();
  const existe = await prisma.user.findUnique({ where: { email } });
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

  // O admin pode indicar uma palavra-passe; caso contrário o sistema gera uma.
  const senha: string = b.senha && String(b.senha).trim() ? String(b.senha).trim() : gerarSenha();

  const hash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.create({
    data: {
      nome: b.nome,
      email,
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

  // As credenciais são devolvidas UMA única vez, para o admin entregar ao aluno.
  return NextResponse.json(
    { aluno: user.aluno, credenciais: { nome: user.nome, email: user.email, senha } },
    { status: 201 }
  );
}
