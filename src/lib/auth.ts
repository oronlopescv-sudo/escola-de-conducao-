import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSecret } from "@/lib/jwt-secret";

export type Sessao = { userId: string; role: "ADMIN" | "SUPERADMIN" | "ALUNO"; nome: string; escolaId?: string };

export async function criarToken(payload: Sessao) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verificarToken(token: string): Promise<Sessao | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as Record<string, unknown>;
    // Validação do payload: sem userId string e role conhecida, o token é recusado.
    if (
      typeof p.userId !== "string" ||
      typeof p.nome !== "string" ||
      (p.role !== "ADMIN" && p.role !== "ALUNO")
    ) {
      return null;
    }
    return payload as unknown as Sessao;
  } catch {
    return null;
  }
}

export async function sessaoAtual(): Promise<Sessao | null> {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  return verificarToken(token);
}
