import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/auth";

// Mock módulos
const MODULOS = [
  { id: "m1", numero: 1, titulo: "Legislação de Trânsito", descricao: "Leis e regulamentos", videoUrl: "https://youtube.com/watch?v=1", _count: { questoes: 15 } },
  { id: "m2", numero: 2, titulo: "Sinais de Trânsito", descricao: "Sinais e placas", videoUrl: "https://youtube.com/watch?v=2", _count: { questoes: 12 } },
  { id: "m3", numero: 3, titulo: "Direção Defensiva", descricao: "Técnicas seguras", videoUrl: "https://youtube.com/watch?v=3", _count: { questoes: 18 } },
  { id: "m4", numero: 4, titulo: "Mecânica Básica", descricao: "Conhecimento do veículo", videoUrl: "https://youtube.com/watch?v=4", _count: { questoes: 10 } },
  { id: "m5", numero: 5, titulo: "Primeiros Socorros", descricao: "Atendimento emergencial", videoUrl: "https://youtube.com/watch?v=5", _count: { questoes: 14 } },
];

export async function GET() {
  try {
    const s = await sessaoAtual();
    if (!s) return NextResponse.json({ erro: "Não autorizado" }, { status: 403 });

    // Para aluno, marca alguns como concluído
    if (s.role === "ALUNO") {
      const concluidos = ["m1", "m2"];
      return NextResponse.json(
        MODULOS.map((m) => ({
          ...m,
          concluido: concluidos.includes(m.id),
        }))
      );
    }

    return NextResponse.json(MODULOS);
  } catch (error: any) {
    console.error("❌ Módulos erro:", error);
    return NextResponse.json({ erro: "Erro ao carregar módulos" }, { status: 500 });
  }
}
