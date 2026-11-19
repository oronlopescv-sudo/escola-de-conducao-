export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Webhook Stripe: pagamento confirmado -> espaço da escola liberado.
// O link de pagamento (APP_STRIPE_PAYMENT_LINK) recebe ?client_reference_id=<slug da
// escola>; o checkout devolve esse valor em client_reference_id/metadata.

function verificarAssinaturaStripe(corpo: string, header: string, secret: string): boolean {
  try {
    const partes = Object.fromEntries(
      header.split(",").map((p) => {
        const [k, v] = p.split("=", 2);
        return [k, v] as [string, string];
      })
    );
    if (!partes.t || !partes.v1) return false;
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(`${partes.t}.${corpo}`)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(partes.v1));
  } catch {
    return false;
  }
}

interface StripeEvento {
  type?: string;
  data?: { object?: Record<string, any> };
}

export async function POST(req: Request) {
  const corpo = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const assinatura = req.headers.get("stripe-signature");

  if (secret) {
    const valido = assinatura ? verificarAssinaturaStripe(corpo, assinatura, secret) : false;
    if (!valido) return NextResponse.json({ erro: "Assinatura inválida." }, { status: 400 });
  }

  let ev: StripeEvento;
  try {
    ev = JSON.parse(corpo) as StripeEvento;
  } catch {
    return NextResponse.json({ erro: "Corps invalide." }, { status: 400 });
  }
  if (!ev?.type || !ev?.data) return NextResponse.json({ recebido: true });

  try {
    if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") {
      const sessao = ev.data!.object!;
      const ref: string | undefined =
        sessao.client_reference_id || sessao.metadata?.escolaSlug || sessao.metadata?.escolaId;
      if (ref) {
        const esc = await prisma.escola.findFirst({ where: { OR: [{ id: ref }, { slug: ref }] } });
        if (esc) {
          await prisma.escola.update({
            where: { id: esc.id },
            data: {
              ativo: true,
              stripeCustomerId: sessao.customer ?? esc.stripeCustomerId,
              stripeSubscriptionId: sessao.subscription ?? esc.stripeSubscriptionId,
              pagamentoAte: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            },
          });
        }
      }
    } else if (ev.type === "invoice.paid") {
      const inv = ev.data!.object!;
      const esc = await prisma.escola.findFirst({
        where: {
          OR: [
            { stripeSubscriptionId: inv.subscription ?? "" },
            { stripeCustomerId: inv.customer ?? "" },
          ],
        },
      });
      if (esc) {
        const fim = inv.lines?.data?.[0]?.period?.end;
        await prisma.escola.update({
          where: { id: esc.id },
          data: {
            ativo: true,
            pagamentoAte: fim ? new Date(fim * 1000) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        });
      }
    } else if (ev.type === "invoice.payment_failed" || ev.type === "customer.subscription.deleted") {
      const obj = ev.data!.object!;
      const subId: string = obj.subscription ?? obj.id ?? "";
      const esc = subId
        ? await prisma.escola.findFirst({ where: { stripeSubscriptionId: subId } })
        : null;
      if (esc) {
        await prisma.escola.update({ where: { id: esc.id }, data: { ativo: false } });
      }
    }
  } catch (e) {
    console.error("Webhook Stripe :", e);
  }

  return NextResponse.json({ recebido: true });
}
