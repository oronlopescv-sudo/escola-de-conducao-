"use client";
import { useEffect, useState } from "react";

type Dados = {
  melhorResultado: number;
  tentativas: { id: string; criadaEm: string; total: number; acertos: number }[];
};

export default function Resultados() {
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then(setD)
      .catch((e) => {
        console.error("❌ Resultados erro:", e);
        setErro("Erreur lors du chargement des résultats");
      });
  }, []);

  if (erro) return <p className="text-sm text-stop">{erro}</p>;
  if (!d) return <p className="text-sm text-asfalto/50">Chargement...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-1">Mes résultats</h1>
      <p className="text-sm text-asfalto/60 mb-6">
        Meilleur résultat : <span className="font-semibold">{d.melhorResultado}%</span> · Seuil de réussite : 80 %
      </p>

      {d.tentativas.length === 0 ? (
        <div className="card text-sm text-asfalto/50">
          Vous n’avez pas encore passé d’examen blanc. Commencez par « Examen blanc ».
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-asfalto/50 border-b border-linha">
                <th className="p-4">Date</th>
                <th className="p-4">Bonnes réponses</th>
                <th className="p-4">Résultat</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {d.tentativas.map((t) => {
                const pct = Math.round((t.acertos / t.total) * 100);
                return (
                  <tr key={t.id} className="border-b border-linha last:border-0">
                    <td className="p-4">{new Date(t.criadaEm).toLocaleString("fr-FR")}</td>
                    <td className="p-4">{t.acertos}/{t.total}</td>
                    <td className="p-4 font-display font-bold">{pct}%</td>
                    <td className="p-4">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${pct >= 80 ? "bg-verde/15 text-verde" : "bg-stop/15 text-stop"}`}>
                        {pct >= 80 ? "Réussi" : "Échoué"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
