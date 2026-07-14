// Rate limiter em memória (por processo). Suficiente para uma instância;
// para múltiplas instâncias, substituir por Redis.
const janelas = new Map<string, { count: number; reset: number }>();

export function rateLimit(chave: string, limite: number, janelaMs: number): boolean {
  const agora = Date.now();
  const atual = janelas.get(chave);
  if (!atual || agora > atual.reset) {
    janelas.set(chave, { count: 1, reset: agora + janelaMs });
    return true;
  }
  if (atual.count >= limite) return false;
  atual.count++;
  return true;
}
