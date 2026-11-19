// Envoi d'e-mails transactionnels via Resend (variables d'environnement du service).
// Sans RESEND_API_KEY/EMAIL_FROM, mailConfigurado() = false et rien n'est envoyé.

export function mailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function enviarMail(to: string, assunto: string, html: string): Promise<boolean> {
  if (!mailConfigurado()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject: assunto, html }),
    });
    if (!res.ok) {
      console.error("Resend a refusé l'envoi :", res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("Envoi d'e-mail échoué :", e);
    return false;
  }
}

export function mailCredenciaisHtml(nome: string, email: string, senha: string): string {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f4;padding:24px">
    <h2 style="color:#1c1c1c">Bienvenue à Auto-École CV, ${nome} !</h2>
    <p>Votre compte a été créé. Voici vos identifiants pour vous connecter :</p>
    <p style="background:#ffffff;border:1px solid #ddd;padding:12px;border-radius:8px">
      <strong>E-mail :</strong> ${email}<br/>
      <strong>Mot de passe :</strong> ${senha}
    </p>
    <p style="color:#555">Connectez-vous sur votre espace élève pour suivre vos modules
    et passer vos examens blancs. <strong>Conservez ce mot de passe :</strong> il ne sera
    plus affiché après cet e-mail.</p>
  </div>`;
}

export async function enviarMailCredenciais(opts: {
  para: string;
  nome: string;
  senha: string;
}): Promise<boolean> {
  return enviarMail(opts.para, "Vos identifiants — Auto-École CV", mailCredenciaisHtml(opts.nome, opts.para, opts.senha));
}
