// Resolvedor único do segredo JWT — usado pela API e pelo middleware.
// Sem fallback silencioso em produção: se o segredo não está definido, falha.
export function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET est obligatoire en production.");
    }
    return new TextEncoder().encode("dev-secret-mudar");
  }
  return new TextEncoder().encode(s);
}
