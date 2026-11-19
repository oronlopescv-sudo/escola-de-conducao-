"use client";

import { useCallback, useEffect, useState } from "react";

type Escola = {
  id: string;
  nome: string;
  slug: string;
  email: string;
  telefone: string | null;
  morada: string | null;
  ativo: boolean;
  pagamentoAte: string | null;
  criadoEm: string;
  admins: { email: string; nome: string }[];
  _count: { alunos: number; agendamentos: number; tentativas: number };
};

type Credenciais = { nome: string; email: string; senha: string } | null;

const FORM_VAZIO = {
  nome: "",
  email: "",
  emailAdmin: "",
  adminNome: "",
  telefone: "",
  morada: "",
};

export default function SuperadminPage() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [pagamentoBase, setPagamentoBase] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [credenciais, setCredenciais] = useState<Credenciais>(null);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const r = await fetch("/api/superadmin/escolas");
      if (r.status === 200) {
        const d = await r.json();
        setEscolas(d.escolas || []);
        setPagamentoBase(d.pagamentoBase || "");
      } else {
        setErro("Erreur au chargement des écoles.");
      }
    } catch {
      setErro("Erreur au chargement des écoles.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criarEscola() {
    setAGuardar(true);
    setErro("");
    try {
      const r = await fetch("/api/superadmin/escolas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (r.status === 201) {
        if (d.credenciais) setCredenciais(d.credenciais);
        setForm(FORM_VAZIO);
        setMostrarForm(false);
        await carregar();
      } else {
        setErro(d.erro || "Erreur du serveur.");
      }
    } catch {
      setErro("Erreur du serveur.");
    } finally {
      setAGuardar(false);
    }
  }

  async function alternarLiberacao(e: Escola) {
    if (!confirm(e.ativo ? `Bloquer l'espace de ${e.nome} ?` : `Liberar l'espace de ${e.nome} ?`)) return;
    setErro("");
    try {
      const r = await fetch("/api/superadmin/escolas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, ativo: !e.ativo }),
      });
      if (r.status === 200) await carregar();
      else {
        const d = await r.json();
        setErro(d.erro || "Erreur du serveur.");
      }
    } catch {
      setErro("Erreur du serveur.");
    }
  }

  async function resetAdmin(e: Escola) {
    if (!confirm(`Renouveler le mot de passe de l'admin de ${e.nome} ?`)) return;
    setErro("");
    try {
      const r = await fetch("/api/superadmin/escolas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, resetAdmin: true }),
      });
      const d = await r.json();
      if (r.status === 200) {
        if (d.credenciais) setCredenciais(d.credenciais);
        await carregar();
      } else setErro(d.erro || "Erreur du serveur.");
    } catch {
      setErro("Erreur du serveur.");
    }
  }

  function copiar(t: string) {
    navigator.clipboard?.writeText(t);
  }

  function linkPagamento(e: Escola) {
    return pagamentoBase ? `${pagamentoBase}?client_reference_id=${e.slug}` : "";
  }

  return (
    <main className="min-h-screen bg-pedra px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-asfalto/50">Plateforme</p>
            <h1 className="text-2xl font-bold text-asfalto">Gestion des auto-écoles</h1>
          </div>
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? "Fermer" : "➕ Nouvelle auto-école"}
          </button>
        </div>

        {!pagamentoBase && (
          <p className="mb-4 rounded-lg bg-rouge/10 px-4 py-3 text-sm text-asfalto/80">
            APP_STRIPE_PAYMENT_LINK n&apos;est pas défini — le lien de paiement par école
            n&apos;est pas affiché. Le super-admin peut libérer l&apos;espace manuellement.
          </p>
        )}
        {erro && (
          <p className="mb-4 rounded-lg bg-stop/10 px-4 py-3 text-sm font-semibold text-stop">{erro}</p>
        )}

        {mostrarForm && (
          <div className="mb-6 rounded-xl border border-asfalto/10 bg-white p-5">
            <h2 className="mb-4 font-bold">Créer une auto-école</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input" placeholder="Nom de l'auto-école *" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input className="input" placeholder="E-mail de l'école *" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder="E-mail de l'admin (par défaut : l'e-mail de l'école)"
                value={form.emailAdmin} onChange={(e) => setForm({ ...form, emailAdmin: e.target.value })} />
              <input className="input" placeholder="Nom de l'admin (par défaut : Administrateur)"
                value={form.adminNome} onChange={(e) => setForm({ ...form, adminNome: e.target.value })} />
              <input className="input" placeholder="Téléphone" value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              <input className="input" placeholder="Adresse" value={form.morada}
                onChange={(e) => setForm({ ...form, morada: e.target.value })} />
            </div>
            <button className="btn-dark mt-4" disabled={aGuardar} onClick={criarEscola}>
              {aGuardar ? "Création..." : "Créer l'auto-école (espace non libéré)"}
            </button>
            <p className="mt-2 text-xs text-asfalto/60">
              Les identifiants de l&apos;admin sont générés et affichés une seule fois.
            </p>
          </div>
        )}

        {carregando ? (
          <p className="p-6 text-asfalto/60">Chargement...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-asfalto/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-pedra/60 text-xs uppercase tracking-wide text-asfalto/60">
                <tr>
                  <th className="p-4">Auto-école</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Élèves</th>
                  <th className="p-4">Rendez-vous</th>
                  <th className="p-4">Examens blancs</th>
                  <th className="p-4">Espace</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {escolas.map((e) => (
                  <tr key={e.id} className="border-t border-asfalto/10">
                    <td className="p-4 font-medium">
                      {e.nome}
                      <span className="ml-2 rounded bg-sinal/20 px-2 py-0.5 text-xs font-semibold">{e.slug}</span>
                      {e.pagamentoAte && (
                        <span className="ml-2 text-xs text-asfalto/50">
                          payé jusqu&apos;au {new Date(e.pagamentoAte).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-asfalto/70">{e.admins.map((a) => a.email).join(", ") || "—"}</td>
                    <td className="p-4">{e._count.alunos}</td>
                    <td className="p-4">{e._count.agendamentos}</td>
                    <td className="p-4">{e._count.tentativas}</td>
                    <td className="p-4">
                      <button
                        onClick={() => alternarLiberacao(e)}
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          e.ativo ? "bg-verde/15 text-verde" : "bg-stop/15 text-stop"
                        }`}
                      >
                        {e.ativo ? "Libéré" : "Non libéré"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button onClick={() => resetAdmin(e)} className="text-asfalto/70 hover:underline">
                          Renouveler mot de passe admin
                        </button>
                        {pagamentoBase && (
                          <button onClick={() => copiar(linkPagamento(e))} className="text-asfalto/70 hover:underline">
                            Copier le lien de paiement
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {escolas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-asfalto/50">
                      Aucune auto-école créée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {credenciais && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-asfalto/40 p-4" onClick={() => setCredenciais(null)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={(ev) => ev.stopPropagation()}>
              <h2 className="mb-2 text-lg font-bold text-verde">Compte créé !</h2>
              <p className="mb-3 text-sm text-asfalto/70">
                Le mot de passe ne sera plus jamais affiché — communiquez-le à l&apos;intéressé
                maintenant ou utilisez « Copier les identifiants ».
              </p>
              <p className="mb-4 rounded-lg bg-pedra/60 p-3 font-mono text-sm">
                {credenciais.nome} — {credenciais.email} — {credenciais.senha}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-primary flex-1"
                  onClick={() => copiar(`Auto-École CV — Connexion\nE-mail : ${credenciais.email}\nMot de passe : ${credenciais.senha}`)}
                >
                  Copier les identifiants
                </button>
                <button className="btn-dark flex-1" onClick={() => setCredenciais(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
