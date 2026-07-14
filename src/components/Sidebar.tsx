"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar({
  itens,
  titulo,
}: {
  itens: { href: string; label: string }[];
  titulo: string;
}) {
  const path = usePathname();
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-asfalto text-white flex flex-col">
      {/* linha central da estrada */}
      <div
        className="absolute inset-y-0 right-0 w-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #F7B500 0 18px, transparent 18px 34px)",
        }}
      />
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rotate-45 rounded bg-sinal border-2 border-white" />
          <span className="font-display font-extrabold text-lg">
            AutoEscola <span className="text-sinal">CV</span>
          </span>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-white/40">{titulo}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {itens.map((i) => {
          const ativo = path === i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                ativo ? "bg-sinal text-asfalto" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button onClick={sair} className="w-full rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white text-left">
          Terminar sessão
        </button>
      </div>
    </aside>
  );
}
