"use client";
import { useEffect, useState } from "react";

type Aluno = {
  id: string;
  categoria: string;
  telefone?: string;
  ativo: boolean;
  dataInscricao: string;
  user: { nome: string; email: string };
  _count: { tentativas: number; progresso: number };
};

type Credenciais = { nome: string; email: string; senha: string };

const categorias = ["A", "B", "C", "D", "F", "A1", "B1", "C1", "D1", "BE", "CE", "DE"];

const FORM_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  telefone: "",
  documento: "",
  morada: "",
  categoria: "B",
  dataNascimento: "",
};

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [totalModulos, setTotalModulos] = useState(23);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [credenciais, setCredenciais] = useState<Credenciais | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);

  async function carregar() {
    const [r, m] = await Promise.all([fetch("/api/alunos"), fetch("/api/modulos")]);
    if (r.ok) setAlunos(await r.json());
    if (m.ok) {
      const mods = await m.json();
      if (Array.isArray(mods) && mods.length > 0) setTotalModulos(mods.length);
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAGuardar(true);
    try {
      const r = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const d = await r.json();
        setErro(d.erro || "Erro ao criar aluno.");
        return;
      }
      const d = await r.json();
      setForm(FORM_VAZIO);
      setMostrarForm(false);
      setCopiado(false);
      if (d.credenciais) setCredenciais(d.credenciais);
      carregar();
    } catch {
      setErro("Erro de ligação. Tente novamente.");
    } finally {
      setAGuardar(false);
    }
  }

  async function copiarCredenciais() {
    if (!credenciais) return;
    const texto = `AutoEscola CV — Acesso do aluno\nNome: ${credenciais.nome}\nSite: ${window.location.origin}/login\nEmail: ${credenciais.email}\nPalavra-passe: ${credenciais.senha}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      // Clipboard indisponível (ex.: HTTP sem TLS) — seleção manual continua possível
      alert(texto);
    }
  }

  async function alternarAtivo(a: Aluno) {
    await fetch(`/api/alunos/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !a.ativo }),
    });
    carregar();
  }

  async function eliminar(a: Aluno) {
    if (!confirm(`Eliminar o aluno ${a.user.nome}? Esta ação é permanente.`)) return;
    await fetch(`/api/alunos/${a.id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold">Alunos</h1>
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Fechar" : "Inscrever aluno"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={criar} className="card mb-6 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 rounded-lg bg-sinal/10 border border-sinal/40 p-3 text-sm">
            Preencha os dados do aluno. Ao guardar, o sistema <b>gera automaticamente a palavra-passe</b> e
            mostra as credenciais de acesso para entregar ao aluno.
          </div>
          <div>
            <label className="label">Nome completo *</label>
            <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email (será o login do aluno) *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input className="input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div>
            <label className="label">Documento de identificação (BI/CNI)</label>
            <input className="input" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </div>
          <div>
            <label className="label">Morada</label>
            <input className="input" value={form.morada} onChange={(e) => setForm({ ...form, morada: e.target.value })} />
          </div>
          <div>
            <label className="label">Data de nascimento</label>
            <input className="input" type="date" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} />
          </div>
          <div>
            <label className="label">Categoria da carta</label>
            <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {categorias.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Palavra-passe (opcional — vazio = gerada automaticamente)</label>
            <input
              className="input"
              value={form.senha}
              placeholder="Deixar vazio para gerar"
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
          </div>
          {erro && <p className="text-sm text-stop md:col-span-2">{erro}</p>}
          <div className="md:col-span-2">
            <button className="btn-dark" disabled={aGuardar}>
              {aGuardar ? "A guardar..." : "Guardar inscrição"}
            </button>
          </div>
        </form>
      )}

      {credenciais && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-display text-xl font-extrabold mb-1">✅ Aluno inscrito!</h2>
            <p className="text-sm text-asfalto/60 mb-4">
              Entregue estas credenciais ao aluno. Por segurança, a palavra-passe{" "}
              <b>não voltará a ser mostrada</b>.
            </p>
            <div className="rounded-lg border border-linha bg-asfalto/5 p-4 space-y-2 text-sm">
              <p><span className="text-asfalto/50">Nome:</span> <b>{credenciais.nome}</b></p>
              <p><span className="text-asfalto/50">Email (login):</span> <b>{credenciais.email}</b></p>
              <p>
                <span className="text-asfalto/50">Palavra-passe:</span>{" "}
                <b className="font-mono text-lg tracking-widest">{credenciais.senha}</b>
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={copiarCredenciais} className="btn-primary flex-1">
                {copiado ? "✓ Copiado" : "Copiar credenciais"}
              </button>
              <button onClick={() => setCredenciais(null)} className="btn-dark flex-1">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-asfalto/50 border-b border-linha">
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Módulos</th>
              <th className="p-4">Simulados</th>
              <th className="p-4">Estado</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((a) => (
              <tr key={a.id} className="border-b border-linha last:border-0">
                <td className="p-4 font-medium">{a.user.nome}</td>
                <td className="p-4 text-asfalto/60">{a.user.email}</td>
                <td className="p-4">
                  <span className="inline-block rounded bg-sinal/20 px-2 py-0.5 font-semibold">{a.categoria}</span>
                </td>
                <td className="p-4">{a._count.progresso}/{totalModulos}</td>
                <td className="p-4">{a._count.tentativas}</td>
                <td className="p-4">
                  <button
                    onClick={() => alternarAtivo(a)}
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      a.ativo ? "bg-verde/15 text-verde" : "bg-stop/15 text-stop"
                    }`}
                  >
                    {a.ativo ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => eliminar(a)} className="text-xs text-stop hover:underline">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {alunos.length === 0 && (
              <tr>
                <td className="p-6 text-asfalto/50" colSpan={7}>
                  Ainda não há alunos inscritos. Use "Inscrever aluno" para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
