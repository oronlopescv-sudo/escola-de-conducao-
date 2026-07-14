import Sidebar from "@/components/Sidebar";

const itens = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/agendamentos", label: "Agendamentos" },
  { href: "/admin/modulos", label: "Módulos e Vídeos" },
  { href: "/admin/questoes", label: "Banco de Questões" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar itens={itens} titulo="Administração" />
      <main className="ml-60 p-8">{children}</main>
    </div>
  );
}
