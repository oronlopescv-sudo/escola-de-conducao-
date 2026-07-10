"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Dados = {
  categoria: string;
  modulosConcluidos: number;
  totalModulos: number;
  melhorResultado: number;
  tentativas: { id: string; criadaEm: string; total: number; acertos: number }[];
};

export default function ProgressoAluno() {
  const [d, setD] = useState<Dados | null>(null);
  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setD);
  }, []);

  if (!d) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  const pctModulos = Math.round((d.modulosConcluidos / d.totalModulos) * 100);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-1">O meu progresso</h1>
      <p className="text-sm text-asfalto/60 mb-6">
        Preparação para o exame teórico — categoria <span className="font-semibold">{d.categoria}</span>
      </p>

      <div className="card mb-4">
        <div className="flex items-end justify-between mb-3">
          <p className="label mb-0">Módulos concluídos</p>
          <p className="font-display font-extrabold text-2xl">
            {d.modulosConcluidos}<span className="text-asfalto/40 text-base">/{d.totalModulos}</span>
          </p>
        </div>
        <div className="estrada">
          <div className="estrada-fill" style={{ width: `${pctModulos}%` }} />
        </div>
        <p className="mt-3 text-sm text-asfalto/60">
          {pctModulos === 100
            ? "Todos os módulos concluídos. Continue a praticar com simulados!"
            : "Continue a estudar os módulos para chegar ao fim da estrada."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="label">Melhor resultado em simulado</p>
          <p className="text-4xl font-display font-extrabold">
            {d.melhorResultado}%
          </p>
          <p className="mt-1 text-xs text-asfalto/50">Meta de aprovação: 80%</p>
        </div>
        <div className="card">
          <p className="label">Simulados realizados</p>
          <p className="text-4xl font-display font-extrabold">{d.tentativas.length}</p>
          <Link href="/aluno/simulado" className="mt-2 inline-block text-sm font-semibold text-asfalto underline">
            Fazer novo simulado →
          </Link>
        </div>
      </div>

      {d.tentativas.length > 0 && (
        <div className="card">
          <p className="label mb-3">Últimos simulados</p>
          <ul className="space-y-2">
            {d.tentativas.slice(0, 5).map((t) => {
              const pct = Math.round((t.acertos / t.total) * 100);
              return (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-asfalto/50">
                    {new Date(t.criadaEm).toLocaleDateString("pt-PT")}
                  </span>
                  <div className="estrada flex-1 h-2">
                    <div className="estrada-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-14 text-right font-semibold ${pct >= 80 ? "text-verde" : "text-stop"}`}>
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
