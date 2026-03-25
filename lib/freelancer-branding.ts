import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma/client";
import { getSignedUrl } from "@/lib/supabase/server";
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  normalizeHexColor,
  normalizeSlug,
  type FreelancerBranding,
} from "@/lib/freelancer-branding-shared";

export {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  normalizeHexColor,
  normalizeSlug,
} from "@/lib/freelancer-branding-shared";
export type { FreelancerBranding } from "@/lib/freelancer-branding-shared";

type SettingsRow = {
  userId: string;
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string | null;
  slug: string;
  userName: string | null;
  userEmail: string | null;
};

async function resolveBranding(row: SettingsRow | null) {
  const primaryColor = normalizeHexColor(
    row?.primaryColor ?? DEFAULT_PRIMARY_COLOR,
    DEFAULT_PRIMARY_COLOR,
  );
  const secondaryColor = normalizeHexColor(
    row?.secondaryColor ?? DEFAULT_SECONDARY_COLOR,
    DEFAULT_SECONDARY_COLOR,
  );

  const backgroundColor = row?.backgroundColor
    ? normalizeHexColor(row.backgroundColor, DEFAULT_PRIMARY_COLOR)
    : null;

  let logoUrl: string | null = null;
  if (row?.logoUrl) {
    try {
      logoUrl = await getSignedUrl(row.logoUrl, 60 * 30);
    } catch {
      logoUrl = null;
    }
  }

  return {
    userId: row?.userId ?? "",
    displayName:
      row?.displayName?.trim() ||
      row?.userName?.trim() ||
      row?.userEmail ||
      "ApproveFlow",
    logoUrl,
    logoPath: row?.logoUrl ?? null,
    primaryColor,
    secondaryColor,
    backgroundColor,
    slug: row?.slug ?? null,
  } satisfies FreelancerBranding;
}

export async function getFreelancerBrandingByUserId(userId: string) {
  let row: SettingsRow | undefined;
  try {
    const [r] = await prisma.$queryRaw<SettingsRow[]>`
      SELECT
        fs."userId",
        fs."displayName",
        fs."logoUrl",
        fs."primaryColor",
        fs."backgroundColor",
        fs."secondaryColor",
        fs."slug",
        u."name" as "userName",
        u."email" as "userEmail"
      FROM "FreelancerSettings" fs
      INNER JOIN "User" u ON u."id" = fs."userId"
      WHERE fs."userId" = ${userId}
      LIMIT 1
    `;
    row = r;
  } catch (err: unknown) {
    // Fallback to a simpler query if the DB doesn't include the backgroundColor column yet.
    const [r] = await prisma.$queryRaw<SettingsRow[]>`
      SELECT
        fs."userId",
        fs."displayName",
        fs."logoUrl",
        fs."primaryColor",
        fs."secondaryColor",
        fs."slug",
        u."name" as "userName",
        u."email" as "userEmail"
      FROM "FreelancerSettings" fs
      INNER JOIN "User" u ON u."id" = fs."userId"
      WHERE fs."userId" = ${userId}
      LIMIT 1
    `;
    row = r as SettingsRow | undefined;
  }

  if (row) return resolveBranding(row);

  const [user] = await prisma.$queryRaw<
    Array<{ userId: string; userName: string | null; userEmail: string | null }>
  >`
    SELECT
      u."id" as "userId",
      u."name" as "userName",
      u."email" as "userEmail"
    FROM "User" u
    WHERE u."id" = ${userId}
    LIMIT 1
  `;

  if (!user) {
    return resolveBranding(null);
  }

  return resolveBranding({
    userId: user.userId,
    displayName: null,
    logoUrl: null,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    secondaryColor: DEFAULT_SECONDARY_COLOR,
    backgroundColor: null,
    slug: "",
    userName: user.userName,
    userEmail: user.userEmail,
  });
}

export async function getFreelancerBrandingBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;
  let row: SettingsRow | undefined;
  try {
    const [r] = await prisma.$queryRaw<SettingsRow[]>`
      SELECT
        fs."userId",
        fs."displayName",
        fs."logoUrl",
        fs."primaryColor",
        fs."backgroundColor",
        fs."secondaryColor",
        fs."slug",
        u."name" as "userName",
        u."email" as "userEmail"
      FROM "FreelancerSettings" fs
      INNER JOIN "User" u ON u."id" = fs."userId"
      WHERE fs."slug" = ${normalizedSlug}
      LIMIT 1
    `;
    row = r;
  } catch (err: unknown) {
    // Fallback to a simpler query if the DB doesn't include the backgroundColor column yet.
    const [r] = await prisma.$queryRaw<SettingsRow[]>`
      SELECT
        fs."userId",
        fs."displayName",
        fs."logoUrl",
        fs."primaryColor",
        fs."secondaryColor",
        fs."slug",
        u."name" as "userName",
        u."email" as "userEmail"
      FROM "FreelancerSettings" fs
      INNER JOIN "User" u ON u."id" = fs."userId"
      WHERE fs."slug" = ${normalizedSlug}
      LIMIT 1
    `;
    row = r as SettingsRow | undefined;
  }

  if (!row) return null;
  return resolveBranding(row);
}

export async function ensureUniqueSlug(slug: string, userId: string) {
  const [existing] = await prisma.$queryRaw<Array<{ userId: string }>>`
    SELECT "userId"
    FROM "FreelancerSettings"
    WHERE "slug" = ${slug}
    LIMIT 1
  `;

  if (existing && existing.userId !== userId) {
    throw new Error("Este slug já está em uso.");
  }
}

export async function getFreelancerLogoPath(userId: string) {
  const [row] = await prisma.$queryRaw<Array<{ logoUrl: string | null }>>`
    SELECT "logoUrl"
    FROM "FreelancerSettings"
    WHERE "userId" = ${userId}
    LIMIT 1
  `;

  return row?.logoUrl ?? null;
}

export async function saveFreelancerBranding(input: {
  userId: string;
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string | null;
  slug: string;
}) {
  try {
    await prisma.$executeRaw`
      INSERT INTO "FreelancerSettings" (
        "id",
        "userId",
        "displayName",
        "logoUrl",
        "primaryColor",
        "backgroundColor",
        "secondaryColor",
        "slug",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${input.userId},
        ${input.displayName},
        ${input.logoUrl},
        ${input.primaryColor},
        ${input.backgroundColor},
        ${input.secondaryColor},
        ${input.slug},
        NOW(),
        NOW()
      )
      ON CONFLICT ("userId")
      DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        "logoUrl" = EXCLUDED."logoUrl",
        "primaryColor" = EXCLUDED."primaryColor",
        "backgroundColor" = EXCLUDED."backgroundColor",
        "secondaryColor" = EXCLUDED."secondaryColor",
        "slug" = EXCLUDED."slug",
        "updatedAt" = NOW()
    `;
  } catch (err: unknown) {
    // Fallback insert/update that omits backgroundColor when the DB doesn't have the column yet.
    await prisma.$executeRaw`
      INSERT INTO "FreelancerSettings" (
        "id",
        "userId",
        "displayName",
        "logoUrl",
        "primaryColor",
        "secondaryColor",
        "slug",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${input.userId},
        ${input.displayName},
        ${input.logoUrl},
        ${input.primaryColor},
        ${input.secondaryColor},
        ${input.slug},
        NOW(),
        NOW()
      )
      ON CONFLICT ("userId")
      DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        "logoUrl" = EXCLUDED."logoUrl",
        "primaryColor" = EXCLUDED."primaryColor",
        "secondaryColor" = EXCLUDED."secondaryColor",
        "slug" = EXCLUDED."slug",
        "updatedAt" = NOW()
    `;
  }
}
