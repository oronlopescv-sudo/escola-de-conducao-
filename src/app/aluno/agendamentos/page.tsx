"use client";
import { useEffect, useState } from "react";

type Agendamento = {
  id: string;
  alunoId: string;
  alunoNome: string;
  tipo: string;
  data: string;
  hora: string;
  duracao: number;
  local: string;
  instrutorNome: string;
  status: string;
};

export default function MinhasAulas() {
  const [aulas, setAulas] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/agendamentos")
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setAulas(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("❌ Agendamentos erro:", e);
        setErro("Erro ao carregar agendamentos");
        setLoading(false);
      });
  }, []);

  if (erro) return <p className="text-sm text-stop">{erro}</p>;
  if (loading) return <p className="text-sm text-asfalto/50">A carregar...</p>;
  if (aulas.length === 0)
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold mb-6">Minhas Aulas</h1>
        <div className="card text-center py-8">
          <p className="text-asfalto/60 mb-3">Nenhuma aula agendada no momento.</p>
          <p className="text-sm text-asfalto/50">Contacte o administrador para agendar.</p>
        </div>
      </div>
    );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Minhas Aulas</h1>

      <div className="space-y-4">
        {aulas.map((aula) => {
          const dataObj = new Date(aula.data);
          const dataFormatada = dataObj.toLocaleDateString("pt-PT");
          const hoje = new Date();
          const passado = dataObj < hoje;

          return (
            <div key={aula.id} className={`card ${passado ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{aula.tipo}</span>
                    <span className={`text-xs px-2 py-1 rounded ${aula.status === "Confirmado" ? "bg-verde/20 text-verde" : "bg-asfalto/20"}`}>
                      {aula.status}
                    </span>
                  </div>
                  <p className="text-sm text-asfalto/60">{aula.instrutorNome}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-extrabold text-lg">{aula.hora}</p>
                  <p className="text-xs text-asfalto/50">{aula.duracao} min</p>
                </div>
              </div>

              <div className="border-t border-asfalto/10 pt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-asfalto/50">📅</span>
                  <span>{dataFormatada}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-asfalto/50">📍</span>
                  <span>{aula.local}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
