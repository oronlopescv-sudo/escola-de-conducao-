"use client";
import { useEffect, useState } from "react";

type Stats = {
  totalAlunos: number;
  ativos: number;
  totalQuestoes: number;
  totalModulos: number;
  totalTentativas: number;
  mediaAproveitamento: number;
  taxaAprovacao: number;
};

export default function AdminDashboard() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setS);
  }, []);

  if (!s) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  const cards = [
    { label: "Alunos inscritos", valor: s.totalAlunos },
    { label: "Alunos ativos", valor: s.ativos },
    { label: "Módulos teóricos", valor: s.totalModulos },
    { label: "Questões no banco", valor: s.totalQuestoes },
    { label: "Simulados realizados", valor: s.totalTentativas },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Painel</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-3xl font-display font-extrabold">{c.valor}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-asfalto/50">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <p className="label">Aproveitamento médio nos simulados</p>
          <p className="text-4xl font-display font-extrabold mb-3">{s.mediaAproveitamento}%</p>
          <div className="estrada">
            <div className="estrada-fill" style={{ width: `${s.mediaAproveitamento}%` }} />
          </div>
        </div>
        <div className="card">
          <p className="label">Taxa de aprovação estimada (≥ 80% de acertos)</p>
          <p className="text-4xl font-display font-extrabold mb-3">{s.taxaAprovacao}%</p>
          <div className="estrada">
            <div className="estrada-fill" style={{ width: `${s.taxaAprovacao}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
