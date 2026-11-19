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
  const [erro, setErro] = useState("");
  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then(setS)
      .catch(() => setErro("Erreur lors du chargement du tableau de bord. Actualisez la page."));
  }, []);

  if (erro) return <p className="text-sm text-stop">{erro}</p>;
  if (!s) return <p className="text-sm text-asfalto/50">Chargement...</p>;

  const cards = [
    { label: "Élèves inscrits", valor: s.totalAlunos },
    { label: "Élèves actifs", valor: s.ativos },
    { label: "Modules théoriques", valor: s.totalModulos },
    { label: "Questions dans la banque", valor: s.totalQuestoes },
    { label: "Examens blancs réalisés", valor: s.totalTentativas },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Tableau de bord</h1>
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
          <p className="label">Score moyen aux examens blancs</p>
          <p className="text-4xl font-display font-extrabold mb-3">{s.mediaAproveitamento}%</p>
          <div className="estrada">
            <div className="estrada-fill" style={{ width: `${s.mediaAproveitamento}%` }} />
          </div>
        </div>
        <div className="card">
          <p className="label">Taux de réussite estimé (≥ 80 % de bonnes réponses)</p>
          <p className="text-4xl font-display font-extrabold mb-3">{s.taxaAprovacao}%</p>
          <div className="estrada">
            <div className="estrada-fill" style={{ width: `${s.taxaAprovacao}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
