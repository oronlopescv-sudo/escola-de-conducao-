// Regras de negócio do Código da Estrada de Cabo Verde (DL 4/2005, art. 122º)

export const IDADES_MINIMAS: Record<string, number> = {
  A1: 16, B1: 16,
  A: 18, B: 18, BE: 18, F: 18,
  C: 21, CE: 21, C1: 21,
  D: 21, DE: 21, D1: 21,
};

export function calcularIdade(dataNascimento: Date, hoje: Date = new Date()): number {
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) idade--;
  return idade;
}

export function validarIdadeCategoria(
  dataNascimento: Date,
  categoria: string,
  hoje: Date = new Date()
): { valido: boolean; idade: number; minima: number } {
  const idade = calcularIdade(dataNascimento, hoje);
  const minima = IDADES_MINIMAS[categoria] ?? 18;
  return { valido: idade >= minima, idade, minima };
}

export function youtubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
