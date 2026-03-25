"use server";

import { prisma } from "@/lib/prisma/client";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function registerUser(
  formData: FormData,
): Promise<{ error?: string }> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) return { error: "Email already in use" };

  const hash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hash,
    },
  });

  // Assign Free plan subscription to every new user
  const freePlan = await prisma.plan.findUnique({
    where: { code: "free" },
    select: { id: true },
  });
  if (freePlan) {
    await prisma.subscription.create({
      data: { userId: user.id, planId: freePlan.id, status: "ACTIVE" },
    });
  }

  // Determine redirect target (from form `next` or default)
  const next = (formData.get("next") as string) || null;

  // Sign in immediately after registration
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: next ?? "/dashboard",
  });

  redirect(next ?? "/dashboard");
}
