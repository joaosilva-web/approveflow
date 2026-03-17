import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "ApproveFlow <noreply@approveflow.app>";
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://approveflow-two.vercel.app";

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
}) {
  const url = `${BASE_URL}/review/${opts.reviewToken}`;
  const versionLabel = opts.label
    ? `Version ${opts.versionNumber} — ${opts.label}`
    : `Version ${opts.versionNumber}`;

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">Hi ${opts.clientName},</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">A new file is ready for your review.</p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:90px">Project</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111">${opts.projectName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#888">Version</td>
        <td style="padding:8px 0;font-size:13px;color:#333">${versionLabel}</td>
      </tr>
    </table>

    <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.01em">
      Review &amp; Approve
    </a>

    <p style="margin:28px 0 0;font-size:12px;color:#9ca3af">
      No account needed — this link opens directly in your browser.
    </p>`;

  const text = `Hi ${opts.clientName},\n\nA new file is ready for your review.\n\nProject: ${opts.projectName}\nVersion: ${versionLabel}\n\nOpen review link:\n${url}\n\nNo account needed — this link opens directly.\n\n— ApproveFlow`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `New file ready for your review — ${opts.projectName}`,
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
}) {
  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">Delivery approved</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">
      <strong>${opts.signerName}</strong> approved the delivery for <strong>${opts.projectName}</strong>.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#555">Log in to your dashboard to see the approval details and download the signed record.</p>
    <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600">
      Go to Dashboard
    </a>`;

  const text = `Delivery approved\n\n${opts.signerName} approved the delivery for ${opts.projectName}.\n\nView details:\n${BASE_URL}/dashboard\n\n— ApproveFlow`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `${opts.projectName} was approved by ${opts.signerName}`,
    html: htmlWrapper(body),
    text,
    headers: UNSUBSCRIBE_HEADERS,
  });
}

// ─── Notify freelancer — client requested changes ────────────────────────────

export async function sendChangesRequestedEmail(opts: {
  to: string;
  projectName: string;
  clientName: string;
  reviewToken: string;
}) {
  const url = `${BASE_URL}/review/${opts.reviewToken}?preview=1`;

  const body = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111">Changes requested</p>
    <p style="margin:4px 0 24px;font-size:15px;color:#555">
      Your client requested changes on <strong>${opts.projectName}</strong>.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#555">Review the comments and upload a new version when ready.</p>
    <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600">
      View Comments
    </a>`;

  const text = `Changes requested\n\nYour client requested changes on ${opts.projectName}.\n\nView comments:\n${url}\n\n— ApproveFlow`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Changes requested on ${opts.projectName}`,
    html: htmlWrapper(body),
    text,
    headers: UNSUBSCRIBE_HEADERS,
  });
}
