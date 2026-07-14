"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Modulo = {
  id: string;
  numero: number;
  titulo: string;
  descricao?: string;
  videoUrl?: string;
  concluido?: boolean;
  _count: { questoes: number };
};

export default function ModulosAluno() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  useEffect(() => {
    fetch("/api/modulos").then((r) => r.json()).then(setModulos);
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-1">Módulos e Vídeos</h1>
      <p className="text-sm text-asfalto/60 mb-6">Os 23 capítulos do Manual de Código de Estrada de Cabo Verde.</p>
      <div className="space-y-2">
        {modulos.map((m) => (
          <Link
            key={m.id}
            href={`/aluno/modulos/${m.id}`}
            className="card flex items-center gap-4 hover:border-sinal transition-colors"
          >
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-display font-bold ${
                m.concluido ? "bg-verde text-white" : "bg-asfalto text-sinal"
              }`}
            >
              {m.concluido ? "✓" : m.numero}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{m.titulo}</p>
              <p className="text-xs text-asfalto/50">
                {m.videoUrl ? "Vídeo disponível" : "Sem vídeo"} · {m._count.questoes} questões
              </p>
            </div>
            <span className="text-asfalto/30">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
