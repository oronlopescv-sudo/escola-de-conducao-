import Sidebar from "@/components/Sidebar";

const itens = [
  { href: "/aluno", label: "O meu progresso" },
  { href: "/aluno/modulos", label: "Módulos e Vídeos" },
  { href: "/aluno/simulado", label: "Fazer Simulado" },
  { href: "/aluno/resultados", label: "Os meus Resultados" },
];

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar itens={itens} titulo="Portal do Aluno" />
      <main className="ml-60 p-8 max-w-4xl">{children}</main>
    </div>
  );
}
