import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "ApproveFlow <noreply@approveflow.app>";
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://approveflow-two.vercel.app";

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

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `[ApproveFlow] New file ready for review — ${opts.projectName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="margin-bottom:4px">Hi ${opts.clientName},</h2>
        <p style="color:#555;margin-top:4px">A new file is ready for your review.</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr>
            <td style="padding:4px 0;color:#888;font-size:13px">Project</td>
            <td style="padding:4px 0;font-size:13px;font-weight:600">${opts.projectName}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#888;font-size:13px">Version</td>
            <td style="padding:4px 0;font-size:13px">${versionLabel}</td>
          </tr>
        </table>

        <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
          Review &amp; Approve
        </a>

        <p style="color:#aaa;font-size:12px;margin-top:32px">
          No account needed. This link opens directly.
        </p>
      </div>
    `,
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
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `[ApproveFlow] ✅ ${opts.projectName} was approved by ${opts.signerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="margin-bottom:4px">Great news! 🎉</h2>
        <p style="color:#555;margin-top:4px">
          <strong>${opts.signerName}</strong> approved the delivery for <strong>${opts.projectName}</strong>.
        </p>
        <p style="color:#555;font-size:14px">Log in to your dashboard to see the approval details.</p>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
          Go to Dashboard
        </a>
      </div>
    `,
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

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `[ApproveFlow] 🔁 Changes requested for ${opts.projectName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="margin-bottom:4px">Changes requested</h2>
        <p style="color:#555;margin-top:4px">
          Your client requested changes on <strong>${opts.projectName}</strong>.
          Check the comments and upload a new version when ready.
        </p>
        <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
          View Comments
        </a>
      </div>
    `,
  });
}
