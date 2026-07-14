"use client";
import { useEffect, useState } from "react";

type Aluno = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  bi: string;
  categoria: "A" | "B" | "C";
  dataInscricao: string;
};

export default function PerfilAluno() {
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Aluno>>({});

  useEffect(() => {
    fetch("/api/alunos/perfil")
      .then((r) => r.json())
      .then((d) => {
        setAluno(d);
        setForm(d);
        setLoading(false);
      });
  }, []);

  async function salvar() {
    setSaving(true);
    const r = await fetch("/api/alunos/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (r.ok) {
      const d = await r.json();
      setAluno(d);
      alert("✅ Perfil atualizado!");
    } else {
      alert("❌ Erro ao atualizar");
    }
  }

  if (loading) return <p className="text-sm text-asfalto/50">A carregar...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-extrabold mb-6">Meu Perfil</h1>

      <div className="card space-y-4">
        <div>
          <label className="label">Nome Completo</label>
          <input
            type="text"
            value={form.nome || ""}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input
              type="tel"
              value={form.telefone || ""}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">BI (Bilhete de Identidade)</label>
            <input
              type="text"
              value={form.bi || ""}
              disabled
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-asfalto/5"
            />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select
              value={form.categoria || "B"}
              onChange={(e) => setForm({ ...form, categoria: e.target.value as any })}
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Data de Inscrição</label>
          <p className="text-sm text-asfalto/60">
            {form.dataInscricao ? new Date(form.dataInscricao).toLocaleDateString("pt-PT") : "-"}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={salvar}
            disabled={saving}
            className="px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90 disabled:opacity-50"
          >
            {saving ? "A guardar..." : "Guardar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
