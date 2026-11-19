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
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) {
          throw new Error(`API error: ${r.status}`);
        }
        return r.json();
      })
      .then(setD)
      .catch((err) => {
        console.error("❌ Dashboard fetch failed:", err);
        setErro("Erreur lors du chargement du tableau de bord : " + err.message);
      });
  }, []);

  if (erro) return <p className="text-sm text-stop">{erro}</p>;
  if (!d) return <p className="text-sm text-asfalto/50">Chargement...</p>;

  const pctModulos = Math.round((d.modulosConcluidos / d.totalModulos) * 100);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-1">Ma progression</h1>
      <p className="text-sm text-asfalto/60 mb-6">
        Préparation à l’examen théorique — catégorie <span className="font-semibold">{d.categoria}</span>
      </p>

      <div className="card mb-4">
        <div className="flex items-end justify-between mb-3">
          <p className="label mb-0">Modules terminés</p>
          <p className="font-display font-extrabold text-2xl">
            {d.modulosConcluidos}<span className="text-asfalto/40 text-base">/{d.totalModulos}</span>
          </p>
        </div>
        <div className="estrada">
          <div className="estrada-fill" style={{ width: `${pctModulos}%` }} />
        </div>
        <p className="mt-3 text-sm text-asfalto/60">
          {pctModulos === 100
            ? "Tous les modules sont terminés. Continuez à vous entraîner avec les examens blancs !"
            : "Continuez à étudier les modules pour arriver au bout de la route."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="label">Meilleur résultat à l’examen blanc</p>
          <p className="text-4xl font-display font-extrabold">
            {d.melhorResultado}%
          </p>
          <p className="mt-1 text-xs text-asfalto/50">Seuil de réussite : 80 %</p>
        </div>
        <div className="card">
          <p className="label">Examens blancs passés</p>
          <p className="text-4xl font-display font-extrabold">{d.tentativas.length}</p>
          <Link href="/aluno/simulado" className="mt-2 inline-block text-sm font-semibold text-asfalto underline">
            Nouvel examen blanc →
          </Link>
        </div>
      </div>

      {d.tentativas.length > 0 && (
        <div className="card">
          <p className="label mb-3">Derniers examens blancs</p>
          <ul className="space-y-2">
            {d.tentativas.slice(0, 5).map((t) => {
              const pct = Math.round((t.acertos / t.total) * 100);
              return (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-asfalto/50">
                    {new Date(t.criadaEm).toLocaleDateString("fr-FR")}
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
