import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "ApproveFlow <noreply@approveflow.app>";
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://approveflow-two.vercel.app";

type Locale = "pt" | "en";

// ─── Shared HTML wrapper (proper email structure improves deliverability) ─────

function htmlWrapper(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ApproveFlow</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px;width:100%">
          <tr>
            <td style="padding:32px 40px 24px">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9fb;padding:16px 40px;border-top:1px solid #ececee">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
                This email was sent by <strong>ApproveFlow</strong>.<br />
                You received this because a file was shared with you via ApproveFlow.<br />
                If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const UNSUBSCRIBE_HEADERS = {
  "List-Unsubscribe": `<mailto:contato@joaogustavoribeiro.com.br?subject=unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  "X-Entity-Ref-ID": "approveflow-notification",
};

// ─── Send new review link to client ──────────────────────────────────────────

export async function sendNewReviewEmail(opts: {
  to: string;
  projectName: string;
  clientName: string;
  reviewToken: string;
  versionNumber: number;
  label: string | null;
  locale?: Locale;
}) {
  const locale = opts.locale ?? "pt";
  const url = `${BASE_URL}/review/${opts.reviewToken}`;
  const versionLabel = opts.label
    ? `${locale === "pt" ? "Versão" : "Version"} ${opts.versionNumber} — ${opts.label}`
    : `${locale === "pt" ? "Versão" : "Version"} ${opts.versionNumber}`;

  const t =
    locale === "pt"
      ? {
          subject: `Novo arquivo pronto para revisão — ${opts.projectName}`,
          greeting: `Olá ${opts.clientName},`,
          intro: "Um novo arquivo está pronto para a sua revisão.",
          labelProject: "Projeto",
          labelVersion: "Versão",
          cta: "Revisar &amp; Aprovar",
          footer:
            "Sem necessidade de conta — este link abre diretamente no seu navegador.",
          textCta: "Abrir link de revisão:",
          textFooter: "Sem necessidade de conta — este link abre diretamente.",
        }
      : {
          subject: `New file ready for your review — ${opts.projectName}`,
          greeting: `Hi ${opts.clientName},`,
          intro: "A new file is ready for your review.",
          labelProject: "Project",
          labelVersion: "Version",
          cta: "Review &amp; Approve",
          footer:
            "No account needed — this link opens directly in your browser.",
          textCta: "Open review link:",
          textFooter: "No account needed — this link opens directly.",
        };

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">${t.greeting}</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">${t.intro}</p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:90px">${t.labelProject}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111">${opts.projectName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#888">${t.labelVersion}</td>
        <td style="padding:8px 0;font-size:13px;color:#333">${versionLabel}</td>
      </tr>
    </table>

    <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.01em">
      ${t.cta}
    </a>

    <p style="margin:28px 0 0;font-size:12px;color:#9ca3af">${t.footer}</p>`;

  const text =
    locale === "pt"
      ? `Olá ${opts.clientName},\n\nUm novo arquivo está pronto para a sua revisão.\n\nProjeto: ${opts.projectName}\nVersão: ${versionLabel}\n\n${t.textCta}\n${url}\n\n${t.textFooter}\n\n— ApproveFlow`
      : `Hi ${opts.clientName},\n\nA new file is ready for your review.\n\nProject: ${opts.projectName}\nVersion: ${versionLabel}\n\n${t.textCta}\n${url}\n\n${t.textFooter}\n\n— ApproveFlow`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: t.subject,
    html: htmlWrapper(body),
    text,
    headers: UNSUBSCRIBE_HEADERS,
  });
}

// ─── Notify freelancer — client approved ─────────────────────────────────────

export async function sendApprovalEmail(opts: {
  to: string;
  projectName: string;
  clientName: string;
  signerName: string;
  deliveryId: string;
  locale?: Locale;
}) {
  const locale = opts.locale ?? "pt";

  const t =
    locale === "pt"
      ? {
          subject: `${opts.projectName} foi aprovado por ${opts.signerName}`,
          title: "Entrega aprovada",
          body: `<strong>${opts.signerName}</strong> aprovou a entrega de <strong>${opts.projectName}</strong>.`,
          sub: "Acesse seu painel para ver os detalhes da aprovação.",
          cta: "Ir para o Painel",
          text: `Entrega aprovada\n\n${opts.signerName} aprovou a entrega de ${opts.projectName}.\n\nVer detalhes:\n${BASE_URL}/dashboard\n\n— ApproveFlow`,
        }
      : {
          subject: `${opts.projectName} was approved by ${opts.signerName}`,
          title: "Delivery approved",
          body: `<strong>${opts.signerName}</strong> approved the delivery for <strong>${opts.projectName}</strong>.`,
          sub: "Log in to your dashboard to see the approval details.",
          cta: "Go to Dashboard",
          text: `Delivery approved\n\n${opts.signerName} approved the delivery for ${opts.projectName}.\n\nView details:\n${BASE_URL}/dashboard\n\n— ApproveFlow`,
        };

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">${t.title}</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">${t.body}</p>
    <p style="margin:0 0 28px;font-size:14px;color:#555">${t.sub}</p>
    <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600">
      ${t.cta}
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: t.subject,
    html: htmlWrapper(body),
    text: t.text,
    headers: UNSUBSCRIBE_HEADERS,
  });
}

// ─── Notify freelancer — client requested changes ────────────────────────────

export async function sendChangesRequestedEmail(opts: {
  to: string;
  projectName: string;
  clientName: string;
  reviewToken: string;
  locale?: Locale;
}) {
  const locale = opts.locale ?? "pt";
  const url = `${BASE_URL}/review/${opts.reviewToken}?preview=1`;

  const t =
    locale === "pt"
      ? {
          subject: `Alterações solicitadas em ${opts.projectName}`,
          title: "Alterações solicitadas",
          body: `Seu cliente solicitou alterações em <strong>${opts.projectName}</strong>.`,
          sub: "Revise os comentários e envie uma nova versão quando estiver pronto.",
          cta: "Ver Comentários",
          text: `Alterações solicitadas\n\nSeu cliente solicitou alterações em ${opts.projectName}.\n\nVer comentários:\n${url}\n\n— ApproveFlow`,
        }
      : {
          subject: `Changes requested on ${opts.projectName}`,
          title: "Changes requested",
          body: `Your client requested changes on <strong>${opts.projectName}</strong>.`,
          sub: "Review the comments and upload a new version when ready.",
          cta: "View Comments",
          text: `Changes requested\n\nYour client requested changes on ${opts.projectName}.\n\nView comments:\n${url}\n\n— ApproveFlow`,
        };

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">${t.title}</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">${t.body}</p>
    <p style="margin:0 0 28px;font-size:14px;color:#555">${t.sub}</p>
    <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600">
      ${t.cta}
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: t.subject,
    html: htmlWrapper(body),
    text: t.text,
    headers: UNSUBSCRIBE_HEADERS,
  });
}
// ─── Notify freelancer — client comment ────────────────────────────
export async function sendCommentNotificationEmail(opts: {
  to: string;
  projectName: string;
  reviewToken: string;
  authorName: string;
  comment: string;
  locale?: Locale;
}) {
  const locale = opts.locale ?? "pt";
  const reviewUrl = `${BASE_URL}/review/${opts.reviewToken}?preview=1`;
  const safeComment = escapeHtml(opts.comment).replace(/\r?\n/g, "<br />");

  const t =
    locale === "pt"
      ? {
          subject: `Novo comentário em ${opts.projectName}`,
          title: "Novo comentário do cliente",
          body: `<strong>${escapeHtml(opts.authorName)}</strong> comentou no projeto <strong>${escapeHtml(opts.projectName)}</strong>.`,
          quoteLabel: "Comentário",
          sub: "Abra o projeto para responder ou revisar o contexto completo.",
          cta: "Abrir Projeto",
          text: `Novo comentário do cliente\n\n${opts.authorName} comentou no projeto ${opts.projectName}:\n\n"${opts.comment}"\n\nAbrir projeto:\n${reviewUrl}\n\n— ApproveFlow`,
        }
      : {
          subject: `New comment on ${opts.projectName}`,
          title: "New client comment",
          body: `<strong>${escapeHtml(opts.authorName)}</strong> commented on <strong>${escapeHtml(opts.projectName)}</strong>.`,
          quoteLabel: "Comment",
          sub: "Open the project to reply or review the full context.",
          cta: "Open Project",
          text: `New client comment\n\n${opts.authorName} commented on ${opts.projectName}:\n\n"${opts.comment}"\n\nOpen project:\n${reviewUrl}\n\n— ApproveFlow`,
        };

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">${t.title}</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">${t.body}</p>

    <div style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#888">
      ${t.quoteLabel}
    </div>
    <blockquote style="margin:0 0 24px;padding:16px 18px;border-left:4px solid #7c3aed;background:#faf5ff;color:#333;font-size:14px;line-height:1.7">
      "${safeComment}"
    </blockquote>

    <p style="margin:0 0 28px;font-size:14px;color:#555">${t.sub}</p>
    <a href="${reviewUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600">
      ${t.cta}
    </a>`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: t.subject,
    html: htmlWrapper(body),
    text: t.text,
    headers: UNSUBSCRIBE_HEADERS,
  });
}
