import { redirect } from "next/navigation";
import { sessaoAtual } from "@/lib/auth";

export default async function Home() {
  const s = await sessaoAtual();
  if (!s) redirect("/login");
  redirect(s.role === "ADMIN" ? "/admin" : "/aluno");
}
