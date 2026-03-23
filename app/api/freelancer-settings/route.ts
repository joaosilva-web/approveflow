import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  ensureUniqueSlug,
  getFreelancerBrandingByUserId,
  normalizeHexColor,
  normalizeSlug,
  saveFreelancerBranding,
} from "@/lib/freelancer-branding";
import { validateSlugOrThrow } from "@/lib/freelancer-branding-shared";

const settingsSchema = z.object({
  displayName: z.string().trim().max(80).optional().default(""),
  logoUrl: z.string().trim().max(500).optional().nullable(),
  primaryColor: z.string().trim().optional().default(DEFAULT_PRIMARY_COLOR),
  secondaryColor: z.string().trim().optional().default(DEFAULT_SECONDARY_COLOR),
  slug: z.string().trim().min(1).max(60),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const branding = await getFreelancerBrandingByUserId(session.user.id);
  return NextResponse.json(branding);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const slug = normalizeSlug(parsed.data.slug);

  try {
    validateSlugOrThrow(slug);
    await ensureUniqueSlug(slug, session.user.id);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Slug inválido ou já em uso.",
      },
      { status: 409 },
    );
  }

  await saveFreelancerBranding({
    userId: session.user.id,
    displayName: parsed.data.displayName || null,
    logoUrl: parsed.data.logoUrl || null,
    primaryColor: normalizeHexColor(
      parsed.data.primaryColor,
      DEFAULT_PRIMARY_COLOR,
    ),
    secondaryColor: normalizeHexColor(
      parsed.data.secondaryColor,
      DEFAULT_SECONDARY_COLOR,
    ),
    slug,
  });

  const branding = await getFreelancerBrandingByUserId(session.user.id);
  return NextResponse.json(branding);
}
