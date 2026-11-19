export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarToken } from "@/lib/auth";
import { garantirDadosBase } from "@/lib/bootstrap";

export async function POST(req: Request) {
  // NOTA : le limiteur de tentatives (rate-limit) a été retiré à la demande du
  // responsable, car il bloquait des utilisations légitimes. Si des tentatives
  // de brute-force apparaissent à l'avenir, le réactiver avec une limite généreuse.

  let body: { email?: string; senha?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });
  }
  const { email, senha } = body;
  if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
    return NextResponse.json({ erro: "E-mail et mot de passe sont obligatoires." }, { status: 400 });
  }

  try {
    await garantirDadosBase();
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        aluno: { select: { ativo: true } },
        escola: { select: { ativo: true } },
      },
    });
    // Comparaison toujours exécutée à temps constant (évite l'énumération par timing)
    const hashDummy = "$2a$10$C6UzMDM.H6dfI/f/IKcEeO7ZKo8dY1vJ0f0eYhN0y1yQdCkq2eD2a";
    const ok = await bcrypt.compare(senha, user?.senha || hashDummy);
    if (!user || !ok) {
      return NextResponse.json({ erro: "E-mail ou mot de passe incorrects." }, { status: 401 });
    }
    if (user.role === "ALUNO" && user.aluno && !user.aluno.ativo) {
      return NextResponse.json({ erro: "Compte désactivé. Contactez l'auto-école." }, { status: 403 });
    }
    // École sans espace libéré (paiement en attente ou désactivée)
    if (user.escola && !user.escola.ativo) {
      return NextResponse.json(
        { erro: "Auto-école désactivée. Contactez l'administrateur de la plateforme." },
        { status: 403 }
      );
    }

    const token = await criarToken({
      userId: user.id,
      role: user.role,
      nome: user.nome,
      escolaId: user.escolaId ?? undefined,
    });
    const res = NextResponse.json({ role: user.role, success: true });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error: any) {
    console.error("Erreur de connexion :", error);
    return NextResponse.json({ erro: "Erreur du serveur" }, { status: 500 });
  }
}
