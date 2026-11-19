export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { enviarMailCredenciais } from "@/lib/email";

// Mot de passe lisible, sans caractères ambigus (0/O, 1/I/l)
function gerarSenha(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[crypto.randomInt(chars.length)];
  return s;
}

async function exigirSuper() {
  const s = await sessaoAtual();
  return s?.role === "SUPERADMIN" ? s : null;
}

export async function GET() {
  const s = await exigirSuper();
  if (!s) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const escolas = await prisma.escola.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      admins: { select: { email: true, nome: true } },
      _count: { select: { alunos: true, agendamentos: true, tentativas: true } },
    },
  });
  return NextResponse.json({
    pagamentoBase: process.env.APP_STRIPE_PAYMENT_LINK || "",
    escolas,
  });
}

export async function POST(req: Request) {
  const s = await exigirSuper();
  if (!s) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object" || !b.nome || !b.email)
    return NextResponse.json({ erro: "Nom et e-mail de l'école sont obligatoires." }, { status: 400 });

  const slugBase =
    String(b.slug || b.nome)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30) || `ecole-${Date.now()}`;
  const slugExiste = await prisma.escola.findUnique({ where: { slug: slugBase } });
  if (slugExiste)
    return NextResponse.json({ erro: "Un slug d'école existe déjà." }, { status: 409 });

  const emailAdmin = String(b.emailAdmin || b.email).toLowerCase().trim();
  const dup = await prisma.user.findUnique({ where: { email: emailAdmin } });
  if (dup)
    return NextResponse.json({ erro: "Un utilisateur avec cet e-mail existe déjà." }, { status: 409 });

  // A nova escola nasce SEM o espaço liberado — libera-se com o pagamento (Stripe)
  // ou manualmente pelo super-admin.
  try {
    const senhaAdmin = gerarSenha();
    const hash = await bcrypt.hash(senhaAdmin, 10);
    const escola = await prisma.escola.create({
      data: {
        nome: String(b.nome),
        slug: slugBase,
        email: String(b.email),
        ...(b.telefone ? { telefone: String(b.telefone) } : {}),
        ...(b.morada ? { morada: String(b.morada) } : {}),
        ativo: false,
      },
    });
    const admin = await prisma.user.create({
      data: {
        nome: b.adminNome ? String(b.adminNome) : "Administrateur",
        email: emailAdmin,
        senha: hash,
        role: "ADMIN",
        escolaId: escola.id,
      },
    });
    // E-mail des identifiants (sans bloquer la réponse si Resend n'est pas configuré)
    void enviarMailCredenciais({ para: admin.email, nome: admin.nome, senha: senhaAdmin });

    return NextResponse.json(
      {
        escola,
        credenciais: { nome: admin.nome, email: admin.email, senha: senhaAdmin },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Erreur création école :", e);
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const s = await exigirSuper();
  if (!s) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object" || !b.id)
    return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });

  const atual = await prisma.escola.findUnique({ where: { id: String(b.id) } });
  if (!atual) return NextResponse.json({ erro: "École introuvable." }, { status: 404 });

  try {
    const atualizada = await prisma.escola.update({
      where: { id: atual.id },
      data: {
        ...(typeof b.ativo === "boolean" ? { ativo: b.ativo } : {}),
        ...(b.nome ? { nome: String(b.nome) } : {}),
        ...(b.email ? { email: String(b.email) } : {}),
        ...(b.telefone !== undefined ? { telefone: b.telefone ? String(b.telefone) : null } : {}),
        ...(b.morada !== undefined ? { morada: b.morada ? String(b.morada) : null } : {}),
      },
    });

    let credenciais: { nome: string; email: string; senha: string } | null = null;
    if (b.resetAdmin) {
      const admin = await prisma.user.findFirst({
        where: { escolaId: atual.id, role: "ADMIN" },
        orderBy: { criadoEm: "asc" },
      });
      if (admin) {
        const senha = gerarSenha();
        const hash = await bcrypt.hash(senha, 10);
        await prisma.user.update({ where: { id: admin.id }, data: { senha: hash } });
        void enviarMailCredenciais({ para: admin.email, nome: admin.nome, senha });
        credenciais = { nome: admin.nome, email: admin.email, senha };
      } else {
        return NextResponse.json(
          { erro: "Aucun admin pour cette école — créez-le à nouveau." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ escola: atualizada, credenciais });
  } catch (e) {
    console.error("Erreur mise à jour école :", e);
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}

// Apagar escola (super-admin) — remove alunos, rendez-vous, tentativas e admins em cascata
export async function DELETE(req: Request) {
  const s = await exigirSuper();
  if (!s) return NextResponse.json({ erro: "Non autorisé" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ erro: "Requête invalide." }, { status: 400 });
  const atual = await prisma.escola.findUnique({ where: { id } });
  if (!atual) return NextResponse.json({ erro: "École introuvable." }, { status: 404 });
  if (atual.slug === "cv")
    return NextResponse.json(
      { erro: "L'école par défaut de la plateforme ne peut pas être supprimée." },
      { status: 403 }
    );
  try {
    await prisma.escola.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erreur suppression école :", e);
    return NextResponse.json({ erro: "Erreur du serveur." }, { status: 500 });
  }
}
