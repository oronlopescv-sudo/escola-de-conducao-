"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      setLoading(false);
      if (!r.ok) {
        const d = await r.json();
        setErro(d.erro || "Falha no início de sessão.");
        return;
      }
      const d = await r.json();
      if (d.success) {
        // Navegação completa para garantir que o middleware lê o cookie novo
        window.location.href = d.role === "ADMIN" ? "/admin" : "/aluno";
      } else {
        setErro("Resposta inválida do servidor");
      }
    } catch (err: any) {
      setLoading(false);
      setErro(err.message || "Erro de ligação. Tente novamente.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-asfalto p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3">
            <span className="inline-block h-10 w-10 rotate-45 rounded-md bg-sinal border-4 border-white shadow-lg" />
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              AutoEscola <span className="text-sinal">CV</span>
            </h1>
          </div>
          <p className="mt-2 text-sm text-white/60">Código de Estrada de Cabo Verde</p>
        </div>
        <form onSubmit={entrar} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Palavra-passe</label>
            <input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          {erro && <p className="text-sm text-stop">{erro}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
