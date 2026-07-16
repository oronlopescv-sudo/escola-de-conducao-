export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint de diagnóstico TEMPORÁRIO.
// Expõe apenas o estado da ligação à base de dados e o código de erro do Prisma.
// NÃO expõe a password nem o token. Remover depois de estabilizar a produção.
function mascararUrl(url: string | undefined): string {
  if (!url) return "(indefinido)";
  return url.replace(/:[^:@]*@/, ":***@");
}

export async function GET() {
  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    database_url_definido: !!process.env.DATABASE_URL,
    database_url: mascararUrl(process.env.DATABASE_URL),
    jwt_secret_definido: !!process.env.JWT_SECRET,
  };

  // Teste de ligação + diagnóstico de tabelas/admin
  try {
    const utilizadores = await prisma.user.count();
    info.db_ligacao = "OK";
    info.total_utilizadores = utilizadores;
    info.total_admins = await prisma.user.count({ where: { role: "ADMIN" } });
    info.total_modulos = await prisma.modulo.count();
    info.total_alunos = await prisma.aluno.count();
    info.admin_existe = !!(await prisma.user.findUnique({
      where: { email: "admin@autoescola.cv" },
      select: { id: true },
    }));
  } catch (e: any) {
    info.db_ligacao = "FALHOU";
    info.erro_codigo = e?.code ?? null;
    info.erro_mensagem = e?.message ?? String(e);
    info.erro_cliente = e?.clientVersion ?? null;
    return NextResponse.json(info, { status: 200 });
  }

  return NextResponse.json(info, { status: 200 });
}