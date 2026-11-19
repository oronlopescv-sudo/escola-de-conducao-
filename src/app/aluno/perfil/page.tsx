"use client";
import { useEffect, useState } from "react";

type Aluno = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  bi: string;
  categoria: string;
  dataInscricao: string;
};

const categorias = ["A", "B", "C", "D", "F", "A1", "B1", "C1", "D1", "BE", "CE", "DE"];

export default function PerfilAluno() {
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Aluno>>({});

  useEffect(() => {
    fetch("/api/alunos/perfil")
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setAluno(d);
        setForm(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      alert("✅ Profil mis à jour !");
    } else {
      alert("❌ Erreur lors de la mise à jour");
    }
  }

  if (loading) return <p className="text-sm text-asfalto/50">Chargement...</p>;
  if (!aluno) return <p className="text-sm text-stop">Erreur lors du chargement du profil. Actualisez la page.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-extrabold mb-6">Mon profil</h1>

      <div className="card space-y-4">
        <div>
          <label className="label">Nom complet</label>
          <input
            type="text"
            value={form.nome || ""}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="label">Téléphone</label>
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
            <label className="label">Carte d’identité (BI)</label>
            <input
              type="text"
              value={form.bi || ""}
              disabled
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-asfalto/5"
            />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select
              value={form.categoria || "B"}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-white"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Date d’inscription</label>
          <p className="text-sm text-asfalto/60">
            {form.dataInscricao ? new Date(form.dataInscricao).toLocaleDateString("fr-FR") : "-"}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={salvar}
            disabled={saving}
            className="px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
