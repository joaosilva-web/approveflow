"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canCreateProject } from "@/lib/billing/limits";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  clientName: z.string().min(1).max(100),
  clientEmail: z.string().email().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createProject(
  formData: FormData,
): Promise<{ error?: string; upgrade?: boolean } | void> {
  const userId = await requireAuth();

  // Enforce plan-based project limit
  const limitCheck = await canCreateProject(userId);
  if (!limitCheck.allowed) {
    return { error: limitCheck.reason, upgrade: true };
  }

  const raw = {
    name: formData.get("name"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail") || undefined,
    description: formData.get("description") || undefined,
  };

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await prisma.project.create({
    data: {
      userId,
      name: parsed.data.name,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail || null,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateProject(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const userId = await requireAuth();

  const project = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!project) return { error: "Project not found" };

  const raw = {
    name: formData.get("name") ?? undefined,
    clientName: formData.get("clientName") ?? undefined,
    clientEmail: formData.get("clientEmail") ?? undefined,
    description: formData.get("description") ?? undefined,
  };

  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...parsed.data,
      clientEmail: parsed.data.clientEmail || null,
    },
  });

  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath("/dashboard");
  return {};
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  const userId = await requireAuth();

  const project = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!project) return { error: "Project not found" };

  // Deliveries cascade via DB FK. Storage files must be cleaned up separately.
  await prisma.project.delete({ where: { id } });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
