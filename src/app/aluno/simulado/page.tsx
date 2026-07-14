"use client";
import { useState } from "react";
import Link from "next/link";

type Questao = {
  id: string;
  enunciado: string;
  opcaoA: string;
  opcaoB: string;
  opcaoC?: string;
  opcaoD?: string;
};
type Detalhe = { questaoId: string; resposta: string; correta: string; acertou: boolean; explicacao?: string };

export default function Simulado() {
  const [questoes, setQuestoes] = useState<Questao[] | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<{ acertos: number; total: number; detalhes: Detalhe[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function iniciar() {
    setLoading(true);
    setResultado(null);
    setRespostas({});
    try {
      const r = await fetch("/api/simulados?n=20");
      if (!r.ok) throw new Error(`Erro ${r.status}`);
      setQuestoes(await r.json());
    } catch (e: any) {
      console.error("❌ Simulado erro:", e);
      alert("Erro ao carregar simulado");
    }
    setLoading(false);
  }

  async function submeter() {
    try {
      const lista = questoes!.map((q) => ({ questaoId: q.id, resposta: respostas[q.id] || "" }));
      const r = await fetch("/api/simulados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas: lista }),
      });
      if (!r.ok) throw new Error(`Erro ${r.status}`);
      setResultado(await r.json());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      console.error("❌ Submit erro:", e);
      alert("Erro ao submeter simulado");
    }
  }

  const mapaDetalhe = new Map(resultado?.detalhes.map((d) => [d.questaoId, d]));
  const respondidas = Object.keys(respostas).length;

  if (!questoes) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold mb-1">Simulado de Exame Teórico</h1>
        <p className="text-sm text-asfalto/60 mb-6">
          20 questões aleatórias baseadas no Código de Estrada de Cabo Verde. Meta de aprovação: 80%.
        </p>
        <button className="btn-primary" onClick={iniciar} disabled={loading}>
          {loading ? "A preparar..." : "Iniciar simulado"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Simulado</h1>
          {!resultado && (
            <p className="text-sm text-asfalto/60">{respondidas}/{questoes.length} respondidas</p>
          )}
        </div>
        {resultado && (
          <div className="text-right">
            <p className="font-display font-extrabold text-3xl">
              {Math.round((resultado.acertos / resultado.total) * 100)}%
            </p>
            <p className={`text-sm font-semibold ${resultado.acertos / resultado.total >= 0.8 ? "text-verde" : "text-stop"}`}>
              {resultado.acertos / resultado.total >= 0.8 ? "Aprovado no simulado" : "Abaixo da meta de 80%"}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questoes.map((q, i) => {
          const det = mapaDetalhe.get(q.id);
          return (
            <div key={q.id} className="card">
              <p className="font-medium mb-3">{i + 1}. {q.enunciado}</p>
              <div className="space-y-2">
                {(["A", "B", "C", "D"] as const).map((op) => {
                  const texto = (q as any)[`opcao${op}`];
                  if (!texto) return null;
                  const sel = respostas[q.id] === op;
                  let cor = "border-linha";
                  if (det) {
                    if (op === det.correta) cor = "border-verde bg-verde/10";
                    else if (sel && !det.acertou) cor = "border-stop bg-stop/10";
                  } else if (sel) cor = "border-sinal bg-sinal/10";
                  return (
                    <button
                      key={op}
                      disabled={!!det}
                      onClick={() => setRespostas({ ...respostas, [q.id]: op })}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${cor}`}
                    >
                      <span className="font-semibold mr-2">{op})</span>
                      {texto}
                    </button>
                  );
                })}
              </div>
              {det?.explicacao && (
                <p className="mt-3 text-sm text-asfalto/70 border-l-2 border-sinal pl-3">{det.explicacao}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {!resultado ? (
          <button className="btn-primary" onClick={submeter} disabled={respondidas < questoes.length}>
            {respondidas < questoes.length
              ? `Responda a todas (faltam ${questoes.length - respondidas})`
              : "Submeter e corrigir"}
          </button>
        ) : (
          <>
            <button className="btn-primary" onClick={iniciar}>Novo simulado</button>
            <Link href="/aluno/resultados" className="btn-dark">Ver os meus resultados</Link>
          </>
        )}
      </div>
    </div>
  );
}
