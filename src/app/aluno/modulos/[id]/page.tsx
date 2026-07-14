"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { youtubeEmbed } from "@/lib/regras";

type Questao = {
  id: string;
  enunciado: string;
  opcaoA: string;
  opcaoB: string;
  opcaoC?: string;
  opcaoD?: string;
};
type Modulo = {
  id: string;
  numero: number;
  titulo: string;
  descricao?: string;
  videoUrl?: string;
  concluido: boolean;
  questoes: Questao[];
};
type Detalhe = { questaoId: string; resposta: string; correta: string; acertou: boolean; explicacao?: string };

export default function ModuloDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<{ acertos: number; total: number; detalhes: Detalhe[] } | null>(null);

  useEffect(() => {
    fetch(`/api/modulos/${id}`).then((r) => r.json()).then(setModulo);
  }, [id]);

  if (!modulo) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  const embed = youtubeEmbed(modulo.videoUrl);
  const mapaDetalhe = new Map(resultado?.detalhes.map((d) => [d.questaoId, d]));

  async function submeter() {
    const lista = modulo!.questoes
      .filter((q) => respostas[q.id])
      .map((q) => ({ questaoId: q.id, resposta: respostas[q.id] }));
    if (lista.length === 0) return;
    const r = await fetch("/api/simulados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas: lista }),
    });
    if (r.ok) setResultado(await r.json());
  }

  async function marcarConcluido() {
    await fetch("/api/progresso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduloId: modulo!.id }),
    });
    router.push("/aluno/modulos");
    router.refresh();
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-asfalto/40 mb-1">Módulo {modulo.numero}</p>
      <h1 className="font-display text-2xl font-extrabold mb-1">{modulo.titulo}</h1>
      <p className="text-sm text-asfalto/60 mb-6">{modulo.descricao}</p>

      {embed ? (
        <div className="card p-0 overflow-hidden mb-6">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={embed}
              title={modulo.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="card mb-6 text-sm text-asfalto/50">
          Este módulo ainda não tem vídeo. Estude o capítulo {modulo.numero} do Manual e responda às questões abaixo.
        </div>
      )}

      {modulo.questoes.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-bold text-lg mb-3">Exercícios deste módulo</h2>
          <div className="space-y-4">
            {modulo.questoes.map((q, i) => {
              const det = mapaDetalhe.get(q.id);
              return (
                <div key={q.id} className="card">
                  <p className="font-medium mb-3">
                    {i + 1}. {q.enunciado}
                  </p>
                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((op) => {
                      const texto = (q as any)[`opcao${op}`];
                      if (!texto) return null;
                      const selecionada = respostas[q.id] === op;
                      let cor = "border-linha";
                      if (det) {
                        if (op === det.correta) cor = "border-verde bg-verde/10";
                        else if (selecionada && !det.acertou) cor = "border-stop bg-stop/10";
                      } else if (selecionada) cor = "border-sinal bg-sinal/10";
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

          {!resultado ? (
            <button className="btn-primary mt-4" onClick={submeter}>
              Corrigir respostas
            </button>
          ) : (
            <div className="card mt-4 flex items-center justify-between">
              <p className="font-display font-extrabold text-xl">
                {resultado.acertos}/{resultado.total} certas (
                {Math.round((resultado.acertos / resultado.total) * 100)}%)
              </p>
            </div>
          )}
        </div>
      )}

      {!modulo.concluido ? (
        <button className="btn-dark" onClick={marcarConcluido}>
          Marcar módulo como concluído
        </button>
      ) : (
        <p className="text-sm font-semibold text-verde">✓ Módulo concluído</p>
      )}
    </div>
  );
}
