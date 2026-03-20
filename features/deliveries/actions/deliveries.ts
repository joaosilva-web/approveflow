"use server";

import { prisma } from "@/lib/prisma/client";
import { auth } from "@/auth";
import { getSignedUploadUrl, deleteFile } from "@/lib/supabase/server";
import { generateReviewToken } from "@/lib/tokens";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { canUploadVersion, canUploadFile } from "@/features/billing/limits";
import { sendNewReviewEmail } from "@/lib/email";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectLocale(acceptLanguage: string | null): "pt" | "en" {
  if (!acceptLanguage) return "pt";
  // Accept-Language examples: "pt-BR,pt;q=0.9,en-US;q=0.8" or "en-US,en;q=0.9"
  const primary = acceptLanguage.split(",")[0]?.toLowerCase() ?? "";
  return primary.startsWith("pt") ? "pt" : "en";
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createDeliverySchema = z.object({
  projectId: z.string().cuid(),
  label: z.string().max(100).optional(),
  filePath: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.coerce.number().int().positive(),
  mimeType: z.string().min(1),
  allowDownload: z.coerce.boolean().default(true),
  requiresEmail: z.coerce.boolean().default(false),
  expiresInDays: z.coerce.number().int().min(0).max(365).optional(),
  password: z.string().max(100).optional(),
});

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Get a presigned upload URL so the client can upload directly to Supabase.
 * Returns { signedUrl, token, path } or { error }.
 */
export async function getUploadUrl(
  fileName: string,
  contentType: string,
  projectId: string,
  fileSize: number,
): Promise<
  | { signedUrl: string; token: string; path: string; error?: never }
  | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return { error: "Project not found" };

  // Check version limit before issuing the upload URL
  const versionCheck = await canUploadVersion(session.user.id, projectId);
  if (!versionCheck.allowed) return { error: versionCheck.reason! };

  // Check storage quota before issuing the upload URL
  const storageCheck = await canUploadFile(session.user.id, fileSize);
  if (!storageCheck.allowed) return { error: storageCheck.reason! };

  const ext = fileName.split(".").pop() ?? "bin";
  const ts = Date.now();
  const path = `${session.user.id}/${projectId}/${ts}.${ext}`;

  try {
    const data = await getSignedUploadUrl(path);
    return { signedUrl: data.signedUrl, token: data.token, path: data.path };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload URL error" };
  }
}

/**
 * After the client has uploaded the file to Supabase,
 * persist the delivery record and return the review link.
 */
export async function createDelivery(
  raw: Record<string, unknown>,
): Promise<{ reviewToken?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Detect and persist the freelancer's locale on each delivery creation
  const requestHeaders = await headers();
  const locale = detectLocale(requestHeaders.get("accept-language"));
  prisma.user
    .update({ where: { id: session.user.id }, data: { locale } })
    .catch(() => {}); // fire & forget, non-critical

  const parsed = createDeliverySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    projectId,
    label,
    filePath,
    fileName,
    fileSize,
    mimeType,
    allowDownload,
    requiresEmail,
    expiresInDays,
    password,
  } = parsed.data;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: {
      id: true,
      name: true,
      clientName: true,
      clientEmail: true,
      _count: { select: { deliveries: true } },
    },
  });
  if (!project) return { error: "Project not found" };

  // Check version limit
  const versionCheck = await canUploadVersion(session.user.id, projectId);
  if (!versionCheck.allowed) {
    // Se for erro de limite do plano free, retorna mensagem amigável
    // (Só o plano free tem limite, mas a mensagem cobre qualquer plano com limite)
    const planCode = versionCheck.reason?.includes("Free plan")
      ? "free"
      : undefined;
    let message = versionCheck.reason || "Limite de versões atingido.";
    if (planCode === "free") {
      message =
        "Você atingiu o limite de versões do plano gratuito (3 versões). Faça upgrade para continuar.";
    }
    // Opcional: erro estruturado para facilitar tratamento futuro
    return {
      error: JSON.stringify({ code: "VERSION_LIMIT_REACHED", message }),
    };
  }

  const versionNumber = project._count.deliveries + 1;
  const reviewToken = generateReviewToken();

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  let expiresAt: Date | null = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  await prisma.delivery.create({
    data: {
      projectId,
      versionNumber,
      label: label || null,
      filePath,
      fileName,
      fileSize,
      mimeType,
      reviewToken,
      allowDownload,
      requiresEmail,
      expiresAt,
      password: passwordHash,
    },
  });

  // Send email notification to client (fire & forget)
  if (project.clientEmail) {
    sendNewReviewEmail({
      to: project.clientEmail,
      projectName: project.name,
      clientName: project.clientName,
      reviewToken,
      versionNumber,
      label: label || null,
      locale,
    }).catch(console.error);
  }

  return { reviewToken };
}

/**
 * Delete a delivery and its storage file.
 */
export async function deleteDelivery(
  deliveryId: string,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, project: { userId: session.user.id } },
    select: { id: true, filePath: true, projectId: true },
  });
  if (!delivery) return { error: "Delivery not found" };

  // Remove storage file (best-effort)
  await deleteFile(delivery.filePath).catch(console.error);

  await prisma.delivery.delete({ where: { id: deliveryId } });

  revalidatePath(`/dashboard/projects/${delivery.projectId}`);
  return {};
}
