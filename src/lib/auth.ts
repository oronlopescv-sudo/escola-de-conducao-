import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Sessao = { userId: string; role: "ADMIN" | "ALUNO"; nome: string };

// Validação em runtime (não no import) para não quebrar o build sem env vars.
function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && !s) {
    throw new Error("JWT_SECRET é obrigatório em produção. Defina a variável de ambiente.");
  }
  return new TextEncoder().encode(s || "dev-secret-mudar");
}

export async function criarToken(payload: Sessao) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verificarToken(token: string): Promise<Sessao | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
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
