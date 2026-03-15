"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSignedUploadUrl, deleteFile } from "@/lib/supabase";
import { generateReviewToken } from "@/lib/tokens";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  } = parsed.data;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true, _count: { select: { deliveries: true } } },
  });
  if (!project) return { error: "Project not found" };

  const versionNumber = project._count.deliveries + 1;
  const reviewToken = generateReviewToken();

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
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
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
