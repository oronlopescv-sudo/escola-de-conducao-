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
  tipo: "Théorique",
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
    if (!form.alunoId) return setErro("Choisissez un élève.");
    if (!form.data) return setErro("Choisissez une date.");
    if (!form.hora) return setErro("Choisissez une heure.");
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
        setErro(d.erro || "Erreur lors de la création du rendez-vous.");
      }
    } catch {
      setErro("Erreur de connexion. Veuillez réessayer.");
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
    if (!confirm(`Supprimer le rendez-vous de ${aula.alunoNome} du ${new Date(aula.data).toLocaleDateString("fr-FR")} ?`)) return;
    await fetch(`/api/agendamentos/${aula.id}`, { method: "DELETE" });
    carregar();
  }

  if (loading) return <p className="text-sm text-asfalto/50">Chargement...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold">Rendez-vous</h1>
        <button
          onClick={() => { setErro(""); setModal(true); }}
          className="px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90"
        >
          + Nouveau rendez-vous
        </button>
      </div>

      {aulas.length === 0 && (
        <div className="card text-center py-8 text-asfalto/60">
          Aucun rendez-vous planifié. Utilisez « + Nouveau rendez-vous » pour commencer.
        </div>
      )}

      <div className="space-y-3">
        {aulas.map((aula) => {
          const dataFormatada = new Date(aula.data).toLocaleDateString("fr-FR");
          return (
            <div key={aula.id} className="card">
              <div className="grid md:grid-cols-7 grid-cols-2 gap-3 text-sm items-center">
                <div>
                  <p className="text-asfalto/50 text-xs">Élève</p>
                  <p className="font-semibold">{aula.alunoNome}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Type</p>
                  <p className="font-semibold">{aula.tipo}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Date</p>
                  <p>{dataFormatada}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Heure</p>
                  <p className="font-semibold">{aula.hora}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Instructeur</p>
                  <p>{aula.instrutorNome || "—"}</p>
                </div>
                <div>
                  <p className="text-asfalto/50 text-xs">Lieu</p>
                  <p className="text-xs">{aula.local || "—"}</p>
                </div>
                <div className="text-right space-y-1">
                  <p
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      aula.status === "Confirmé"
                        ? "bg-verde/20 text-verde"
                        : aula.status === "Annulé"
                        ? "bg-stop/20 text-stop"
                        : "bg-asfalto/20"
                    }`}
                  >
                    {aula.status}
                  </p>
                  <div className="flex justify-end gap-2 text-xs">
                    {aula.status !== "Annulé" ? (
                      <button onClick={() => mudarStatus(aula, "Annulé")} className="text-stop hover:underline">
                        Annuler
                      </button>
                    ) : (
                      <button onClick={() => mudarStatus(aula, "Confirmé")} className="text-verde hover:underline">
                        Réactiver
                      </button>
                    )}
                    {aula.status === "Confirmé" && (
                      <button onClick={() => mudarStatus(aula, "Terminé")} className="text-asfalto/70 hover:underline">
                        Marquer terminé
                      </button>
                    )}
                    <button onClick={() => eliminar(aula)} className="text-asfalto/50 hover:underline">
                      Supprimer
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
            <h2 className="font-display text-xl font-extrabold mb-4">Nouveau rendez-vous</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="label">Élève *</label>
                <select
                  value={form.alunoId}
                  onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-white"
                >
                  <option value="">— Choisir un élève —</option>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.user.nome} ({a.user.email})
                    </option>
                  ))}
                </select>
                {alunos.length === 0 && (
                  <p className="mt-1 text-xs text-stop">Aucun élève inscrit pour le moment.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm bg-white"
                  >
                    <option>Théorique</option>
                    <option>Pratique</option>
                  </select>
                </div>
                <div>
                  <label className="label">Durée (min)</label>
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
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="label">Heure *</label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="label">Lieu</label>
                <input
                  type="text"
                  placeholder="Ex : Salle de cours - Praia"
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="label">Instructeur</label>
                <input
                  type="text"
                  placeholder="Nom de l'instructeur"
                  value={form.instrutorNome}
                  onChange={(e) => setForm({ ...form, instrutorNome: e.target.value })}
                  className="w-full px-3 py-2 border border-asfalto/20 rounded-lg text-sm"
                />
              </div>

              {erro && <p className="text-sm text-stop">{erro}</p>}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 border border-asfalto/20 rounded-lg font-semibold text-sm hover:bg-asfalto/5">
                Annuler
              </button>
              <button
                onClick={criarAula}
                disabled={aGuardar}
                className="flex-1 px-4 py-2 bg-sinal text-asfalto rounded-lg font-semibold text-sm hover:bg-sinal/90 disabled:opacity-50"
              >
                {aGuardar ? "Création..." : "Créer le rendez-vous"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
