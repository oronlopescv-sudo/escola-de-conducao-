"use client";
import { useEffect, useState } from "react";

type Modulo = {
  id: string;
  numero: number;
  titulo: string;
  descricao?: string;
  videoUrl?: string;
  _count: { questoes: number };
};

export default function Modulos() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", videoUrl: "" });

  async function carregar() {
    const r = await fetch("/api/modulos");
    if (r.ok) setModulos(await r.json());
  }
  useEffect(() => {
    carregar();
  }, []);

  function abrir(m: Modulo) {
    setEditando(m.id);
    setForm({ titulo: m.titulo, descricao: m.descricao || "", videoUrl: m.videoUrl || "" });
  }

  async function guardar(id: string) {
    await fetch(`/api/modulos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(null);
    carregar();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-2">Módulos e Vídeos</h1>
      <p className="text-sm text-asfalto/60 mb-6">
        Os 23 capítulos do Manual de Código de Estrada CV. Cole o link do YouTube em cada módulo para o aluno assistir.
      </p>
      <div className="space-y-3">
        {modulos.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-asfalto text-sinal font-display font-bold text-sm">
                  {m.numero}
                </span>
                <div>
                  <p className="font-semibold">{m.titulo}</p>
                  <p className="text-sm text-asfalto/60">{m.descricao}</p>
                  <p className="mt-1 text-xs text-asfalto/40">
                    {m._count.questoes} questões · {m.videoUrl ? "Vídeo associado" : "Sem vídeo"}
                  </p>
                </div>
              </div>
              <button className="btn-dark" onClick={() => (editando === m.id ? setEditando(null) : abrir(m))}>
                {editando === m.id ? "Fechar" : "Editar"}
              </button>
            </div>
            {editando === m.id && (
              <div className="mt-4 grid gap-3 border-t border-linha pt-4">
                <div>
                  <label className="label">Título</label>
                  <input className="input" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <input className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div>
                  <label className="label">Link do vídeo (YouTube)</label>
                  <input
                    className="input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />
                </div>
                <div>
                  <button className="btn-primary" onClick={() => guardar(m.id)}>
                    Guardar alterações
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
