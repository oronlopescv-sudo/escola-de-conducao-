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

type AlunoOpcao = { id: string; user: { nome: string; email: string } };

const FORM_VAZIO = {
  alunoId: "",
  tipo: "Teórica",
  data: "",
  hora: "",
  duracao: 90,
  local: "",
  instrutorNome: "",
};

export default function Agendamentos() {
  const [aulas, setAulas] = useState<Agendamento[]>([]);
  const [alunos, setAlunos] = useState<AlunoOpcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const [ra, ral] = await Promise.all([fetch("/api/agendamentos"), fetch("/api/alunos")]);
      const d = await ra.json();
      setAulas(Array.isArray(d) ? d : []);
      if (ral.ok) {
        const la = await ral.json();
        setAlunos(Array.isArray(la) ? la : []);
      }
    } catch {
      setAulas([]);
    }
    setLoading(false);
  }

  async function criarAula() {
    setErro("");
    if (!form.alunoId) return setErro("Escolha o aluno.");
    if (!form.data) return setErro("Escolha a data.");
    if (!form.hora) return setErro("Escolha a hora.");
    setAGuardar(true);
    try {
      const r = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        setModal(false);
        setForm(FORM_VAZIO);
        carregar();
      } else {
        const d = await r.json();
        setErro(d.erro || "Erro ao criar aula.");
      }
    } catch {
      setErro("Erro de ligação. Tente novamente.");
    } finally {
      setAGuardar(false);
    }
  }

  async function mudarStatus(aula: Agendamento, status: string) {
    await fetch(`/api/agendamentos/${aula.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    carregar();
  }

  async function eliminar(aula: Agendamento) {
    if (!confirm(`Eliminar a aula de ${aula.alunoNome} em ${new Date(aula.data).toLocaleDateString("pt-PT")}?`)) return;
    await fetch(`/api/agendamentos/${aula.id}`, { method: "DELETE" });
    carregar();
  }

  if (loading) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold">Agendamentos</h1>
        <button
          onClick={() => { setErro(""); setModal(true); }}
          className="px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90"
        >
          + Nova Aula
        </button>
      </div>

      {aulas.length === 0 && (
        <div className="card text-center py-8 text-asfalto/60">
          Nenhuma aula agendada. Use "+ Nova Aula" para criar a primeira.
        </div>
      )}

      <div className="space-y-3">
        {aulas.map((aula) => {
          const dataFormatada = new Date(aula.data).toLocaleDateString("pt-PT");
          return (
            <div key={aula.id} className="card">
              <div className="grid md:grid-cols-7 grid-cols-2 gap-3 text-sm items-center">
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
                  <p>{aula.instrutorNome || "—"}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Local</p>
                  <p className="text-xs">{aula.local || "—"}</p>
                </div>
                <div className="text-right space-y-1">
                  <p
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      aula.status === "Confirmado"
                        ? "bg-verde/20 text-verde"
                        : aula.status === "Cancelado"
                        ? "bg-stop/20 text-stop"
                        : "bg-asfalto/20"
                    }`}
                  >
                    {aula.status}
                  </p>
                  <div className="flex justify-end gap-2 text-xs">
                    {aula.status !== "Cancelado" ? (
                      <button onClick={() => mudarStatus(aula, "Cancelado")} className="text-stop hover:underline">
                        Cancelar
                      </button>
                    ) : (
                      <button onClick={() => mudarStatus(aula, "Confirmado")} className="text-verde hover:underline">
                        Reativar
                      </button>
                    )}
                    <button onClick={() => eliminar(aula)} className="text-asfalto/50 hover:underline">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="font-display text-xl font-extrabold mb-4">Nova Aula</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="label">Aluno *</label>
                <select
                  value={form.alunoId}
                  onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-white"
                >
                  <option value="">— Escolher aluno —</option>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.user.nome} ({a.user.email})
                    </option>
                  ))}
                </select>
                {alunos.length === 0 && (
                  <p className="mt-1 text-xs text-stop">Ainda não há alunos inscritos.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-white"
                  >
                    <option>Teórica</option>
                    <option>Prática</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duração (min)</label>
                  <input
                    type="number"
                    min={15}
                    value={form.duracao}
                    onChange={(e) => setForm({ ...form, duracao: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data *</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="label">Hora *</label>
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

              {erro && <p className="text-sm text-stop">{erro}</p>}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 border border-asfalto/20 rounded-lg font-semibold text-sm hover:bg-asfalto/5">
                Cancelar
              </button>
              <button
                onClick={criarAula}
                disabled={aGuardar}
                className="flex-1 px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90 disabled:opacity-50"
              >
                {aGuardar ? "A criar..." : "Criar Aula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
