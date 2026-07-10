"use client";
import { useEffect, useState } from "react";

type Questao = {
  id: string;
  enunciado: string;
  opcaoA: string;
  opcaoB: string;
  opcaoC?: string;
  opcaoD?: string;
  correta: string;
  explicacao?: string;
  modulo?: { numero: number; titulo: string };
};
type Modulo = { id: string; numero: number; titulo: string };

export default function Questoes() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    enunciado: "",
    opcaoA: "",
    opcaoB: "",
    opcaoC: "",
    opcaoD: "",
    correta: "A",
    explicacao: "",
    moduloId: "",
  });

  async function carregar() {
    const [q, m] = await Promise.all([fetch("/api/questoes"), fetch("/api/modulos")]);
    if (q.ok) setQuestoes(await q.json());
    if (m.ok) setModulos(await m.json());
  }
  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const r = await fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      const d = await r.json();
      setErro(d.erro || "Erro ao criar questão.");
      return;
    }
    setForm({ enunciado: "", opcaoA: "", opcaoB: "", opcaoC: "", opcaoD: "", correta: "A", explicacao: "", moduloId: "" });
    setMostrarForm(false);
    carregar();
  }

  async function eliminar(id: string) {
    if (!confirm("Eliminar esta questão?")) return;
    await fetch(`/api/questoes/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Banco de Questões</h1>
          <p className="text-sm text-asfalto/60">{questoes.length} questões disponíveis para simulados</p>
        </div>
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Fechar" : "Nova questão"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={criar} className="card mb-6 grid gap-3">
          <div>
            <label className="label">Enunciado *</label>
            <textarea className="input" rows={2} value={form.enunciado} onChange={(e) => setForm({ ...form, enunciado: e.target.value })} required />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {(["A", "B", "C", "D"] as const).map((op) => (
              <div key={op}>
                <label className="label">Opção {op}{op === "A" || op === "B" ? " *" : ""}</label>
                <input
                  className="input"
                  value={(form as any)[`opcao${op}`]}
                  onChange={(e) => setForm({ ...form, [`opcao${op}`]: e.target.value })}
                  required={op === "A" || op === "B"}
                />
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="label">Resposta correta</label>
              <select className="input" value={form.correta} onChange={(e) => setForm({ ...form, correta: e.target.value })}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Módulo</label>
              <select className="input" value={form.moduloId} onChange={(e) => setForm({ ...form, moduloId: e.target.value })}>
                <option value="">Sem módulo</option>
                {modulos.map((m) => (
                  <option key={m.id} value={m.id}>{m.numero} — {m.titulo}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Explicação (mostrada após a correção)</label>
            <input className="input" value={form.explicacao} onChange={(e) => setForm({ ...form, explicacao: e.target.value })} />
          </div>
          {erro && <p className="text-sm text-stop">{erro}</p>}
          <div>
            <button className="btn-dark">Guardar questão</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {questoes.map((q, i) => (
          <div key={q.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-asfalto/40 mb-1">
                  #{i + 1}{q.modulo ? ` · Módulo ${q.modulo.numero} — ${q.modulo.titulo}` : ""}
                </p>
                <p className="font-medium mb-2">{q.enunciado}</p>
                <ul className="text-sm space-y-0.5">
                  {(["A", "B", "C", "D"] as const).map((op) => {
                    const texto = (q as any)[`opcao${op}`];
                    if (!texto) return null;
                    return (
                      <li key={op} className={q.correta === op ? "text-verde font-semibold" : "text-asfalto/70"}>
                        {op}) {texto} {q.correta === op && "✓"}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <button onClick={() => eliminar(q.id)} className="text-xs text-stop hover:underline shrink-0">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
