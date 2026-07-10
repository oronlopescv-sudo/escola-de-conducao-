"use client";
import { useEffect, useState } from "react";

type Dados = {
  melhorResultado: number;
  tentativas: { id: string; criadaEm: string; total: number; acertos: number }[];
};

export default function Resultados() {
  const [d, setD] = useState<Dados | null>(null);
  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setD);
  }, []);

  if (!d) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-1">Os meus Resultados</h1>
      <p className="text-sm text-asfalto/60 mb-6">
        Melhor resultado: <span className="font-semibold">{d.melhorResultado}%</span> · Meta de aprovação: 80%
      </p>

      {d.tentativas.length === 0 ? (
        <div className="card text-sm text-asfalto/50">
          Ainda não realizou nenhum simulado. Comece em "Fazer Simulado".
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-asfalto/50 border-b border-linha">
                <th className="p-4">Data</th>
                <th className="p-4">Acertos</th>
                <th className="p-4">Resultado</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {d.tentativas.map((t) => {
                const pct = Math.round((t.acertos / t.total) * 100);
                return (
                  <tr key={t.id} className="border-b border-linha last:border-0">
                    <td className="p-4">{new Date(t.criadaEm).toLocaleString("pt-PT")}</td>
                    <td className="p-4">{t.acertos}/{t.total}</td>
                    <td className="p-4 font-display font-bold">{pct}%</td>
                    <td className="p-4">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${pct >= 80 ? "bg-verde/15 text-verde" : "bg-stop/15 text-stop"}`}>
                        {pct >= 80 ? "Aprovado" : "Reprovado"}
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
