import Sidebar from "@/components/Sidebar";

const itens = [
  { href: "/aluno", label: "Ma progression" },
  { href: "/aluno/modulos", label: "Modules et vidéos" },
  { href: "/aluno/simulado", label: "Examen blanc" },
  { href: "/aluno/resultados", label: "Mes résultats" },
  { href: "/aluno/agendamentos", label: "Mes rendez-vous" },
  { href: "/aluno/perfil", label: "Mon profil" },
];

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar itens={itens} titulo="Espace élève" />
      <main className="ml-60 p-8 max-w-4xl">{children}</main>
    </div>
  );
}
