import Sidebar from "@/components/Sidebar";

const itens = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/alunos", label: "Élèves" },
  { href: "/admin/agendamentos", label: "Rendez-vous" },
  { href: "/admin/modulos", label: "Modules et vidéos" },
  { href: "/admin/questoes", label: "Banque de questions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar itens={itens} titulo="Administration" />
      <main className="ml-60 p-8">{children}</main>
    </div>
  );
}
