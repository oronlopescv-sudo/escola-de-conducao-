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

export default function Agendamentos() {
  const [aulas, setAulas] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    alunoId: "",
    alunoNome: "",
    tipo: "Teórica",
    data: "",
    hora: "",
    duracao: 90,
    local: "",
    instrutorNome: "",
  });

  useEffect(() => {
    carregarAulas();
  }, []);

  async function carregarAulas() {
    const r = await fetch("/api/agendamentos");
    const d = await r.json();
    setAulas(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  async function criarAula() {
    const r = await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      alert("✅ Aula criada!");
      setModal(false);
      setForm({
        alunoId: "",
        alunoNome: "",
        tipo: "Teórica",
        data: "",
        hora: "",
        duracao: 90,
        local: "",
        instrutorNome: "",
      });
      carregarAulas();
    } else {
      alert("❌ Erro ao criar aula");
    }
  }

  if (loading) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold">Agendamentos</h1>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90"
        >
          + Nova Aula
        </button>
      </div>

      <div className="space-y-3">
        {aulas.map((aula) => {
          const dataObj = new Date(aula.data);
          const dataFormatada = dataObj.toLocaleDateString("pt-PT");

          return (
            <div key={aula.id} className="card">
              <div className="grid grid-cols-7 gap-3 text-sm">
                <div>
                  <p className="text-asfalto/50 text-xs">Aluno</p>
                  <p className="font-semibold">{aula.alunoNome}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Tipo</p>
                  <p className="font-semibold">{aula.tipo}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Data</p>
                  <p>{dataFormatada}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Hora</p>
                  <p className="font-semibold">{aula.hora}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Instrutor</p>
                  <p>{aula.instrutorNome}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Local</p>
                  <p className="text-xs">{aula.local}</p>
                </div>
                <div className="text-right">
                  <p className={`px-2 py-1 rounded text-xs font-semibold ${aula.status === "Confirmado" ? "bg-verde/20 text-verde" : "bg-asfalto/20"}`}>
                    {aula.status}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="font-display text-xl font-extrabold mb-4">Nova Aula</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="label">Aluno</label>
                <input
                  type="text"
                  placeholder="Nome do aluno"
                  value={form.alunoNome}
                  onChange={(e) => setForm({ ...form, alunoNome: e.target.value, alunoId: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  >
                    <option>Teórica</option>
                    <option>Prática</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duração (min)</label>
                  <input
                    type="number"
                    value={form.duracao}
                    onChange={(e) => setForm({ ...form, duracao: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="label">Hora</label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="label">Local</label>
                <input
                  type="text"
                  placeholder="Ex: Sala de Aula - Praia"
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="label">Instrutor</label>
                <input
                  type="text"
                  placeholder="Nome do instrutor"
                  value={form.instrutorNome}
                  onChange={(e) => setForm({ ...form, instrutorNome: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 border border-asfalto/20 rounded-lg font-semibold text-sm hover:bg-asfalto/5">
                Cancelar
              </button>
              <button onClick={criarAula} className="flex-1 px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90">
                Criar Aula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
