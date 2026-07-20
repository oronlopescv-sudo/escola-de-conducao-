import Link from "next/link";
import { redirect } from "next/navigation";
import { sessaoAtual } from "@/lib/auth";

export default async function Home() {
  try {
    const s = await sessaoAtual();
    if (s) redirect(s.role === "ADMIN" ? "/admin" : "/aluno");
  } catch (e) {
    // Se falhar a verificação de sessão (ex: BD indisponível), mostra landing page
    console.error("Erro ao verificar sessão:", e);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-faixa text-asfalto">
      {/* ---------- HEADER ---------- */}
      <header className="sticky top-0 z-50 border-b-2 border-asfalto bg-faixa/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="inline-flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rotate-45 rounded-md border-[3px] border-asfalto bg-sinal">
              <span className="-rotate-45 font-display text-sm text-asfalto">CV</span>
            </span>
            <span className="font-display text-xl uppercase tracking-wide text-asfalto">
              AutoEscola <span className="text-stop">CV</span>
            </span>
          </div>
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border-2 border-asfalto bg-asfalto px-5 py-2 font-display text-sm uppercase tracking-wide text-faixa transition-colors hover:bg-transparent hover:text-asfalto"
          >
            Entrar
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="relative border-b-2 border-asfalto bg-asfalto text-faixa">
        {/* faixas diagonais decorativas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #F4F6F8 0 2px, transparent 2px 40px)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sinal/40 bg-sinal/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-sinal">
              Praia · Mindelo · Sal
            </span>
            <h1 className="mt-6 font-display text-[13vw] uppercase leading-[0.92] tracking-tight text-faixa sm:text-6xl lg:text-7xl">
              Aprenda a
              <br />
              conduzir <span className="text-sinal">a sério.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-faixa/70">
              Aulas práticas, teoria do Código de Estrada e acompanhamento
              completo — tudo numa plataforma feita para Cabo Verde.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-sinal px-7 py-3 font-display text-base uppercase tracking-wide text-asfalto shadow-[4px_4px_0_0_#F4F6F8] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#F4F6F8]"
              >
                Entrar na plataforma
              </Link>
              <a
                href="#planos"
                className="font-mono text-sm uppercase tracking-widest text-faixa/60 underline-offset-4 hover:text-faixa hover:underline"
              >
                Ver como funciona ↓
              </a>
            </div>
          </div>

          {/* placa de trânsito ilustrativa */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-xs items-center justify-center sm:flex">
            <div className="absolute inset-0 rounded-full border-[10px] border-stop bg-asfalto-2" />
            <span className="relative font-display text-8xl text-faixa">B</span>
            <span className="absolute -bottom-3 -right-3 rounded-full bg-sinal px-4 py-1.5 font-display text-xs uppercase tracking-wide text-asfalto shadow-[3px_3px_0_0_#1B2430]">
              Categoria B
            </span>
          </div>
        </div>

        {/* estrada / faixa animada no rodapé do hero */}
        <div className="estrada-strip relative h-4 w-full overflow-hidden bg-asfalto-2">
          <div className="estrada-strip-line" />
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="overflow-hidden border-b-2 border-asfalto bg-sinal py-3">
        <div className="marquee flex w-max gap-10 font-display text-sm uppercase tracking-widest text-asfalto">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-10">
              {[
                "Instrutores certificados",
                "Simulados do Código",
                "Marcação de aulas online",
                "Acompanhamento em tempo real",
              ].map((t) => (
                <span key={t} className="flex items-center gap-3">
                  {t} <span aria-hidden>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- FEATURES ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-stop">
            Como funciona
          </span>
          <h2 className="mt-3 font-display text-4xl uppercase leading-tight text-asfalto sm:text-5xl">
            Do primeiro login à carta de condução
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border-2 border-asfalto bg-asfalto sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Aulas Práticas",
              desc: "Acompanhe cada aula de condução, veja o progresso e o feedback do seu instrutor.",
              color: "bg-sinal text-asfalto",
            },
            {
              n: "02",
              title: "Código de Estrada",
              desc: "Estude a teoria com conteúdo atualizado e faça simulados antes do exame oficial.",
              color: "bg-faixa text-asfalto",
            },
            {
              n: "03",
              title: "Acompanhamento",
              desc: "Histórico de marcações, pagamentos e evolução — tudo num só painel.",
              color: "bg-asfalto-2 text-faixa",
            },
          ].map((f) => (
            <div key={f.n} className={`${f.color} flex flex-col gap-6 p-8`}>
              <span className="font-mono text-sm opacity-60">{f.n}</span>
              <h3 className="font-display text-2xl uppercase tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed opacity-80">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section id="planos" className="relative border-y-2 border-asfalto bg-stop text-faixa">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F4F6F8 0 2px, transparent 2px 32px)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl uppercase leading-tight sm:text-4xl">
              Pronto para tirar a carta?
            </h2>
            <p className="mt-2 text-faixa/80">
              Aceda à plataforma e comece hoje o seu percurso.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-faixa px-7 py-3 font-display text-base uppercase tracking-wide text-stop shadow-[4px_4px_0_0_#1B2430] transition-transform hover:-translate-y-0.5"
          >
            Entrar na plataforma →
          </Link>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-asfalto px-6 py-10 text-faixa/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-display text-sm uppercase tracking-wide text-faixa">
            AutoEscola <span className="text-sinal">CV</span>
          </span>
          <span className="font-mono text-xs">
            © {new Date().getFullYear()} · Cabo Verde
          </span>
        </div>
      </footer>
    </main>
  );
}
