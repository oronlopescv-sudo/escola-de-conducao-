import type { Sessao } from "@/lib/auth";

// ADMIN e SUPERADMIN partilham as rotas de gestão; SUPERADMIN vê todas as escolas.
export function eGestor(s: Sessao): boolean {
  return s.role === "ADMIN" || s.role === "SUPERADMIN";
}

// Filtro multi-tenant para consultas: SUPERADMIN (sem escola) -> tudo;
// ADMIN -> apenas a sua própria escola.
export function filtroEscola(s: Sessao): { escolaId?: string } {
  if (s.role === "SUPERADMIN") return {};
  return { escolaId: s.escolaId ?? "__nenhuma_escola__" };
}
