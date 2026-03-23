import { prisma } from "@/lib/prisma/client";
import { getSignedUrl } from "@/lib/supabase/server";
import { getFreelancerBrandingByUserId } from "@/lib/freelancer-branding";
import type { CommentData } from "@/features/review/components/CommentSystem";

type Status = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

type CommentRow = {
  id: string;
  parentId?: string | null;
  authorType: "CLIENT" | "FREELANCER";
  authorName: string;
  content: string;
  audioUrl?: string | null;
  xPosition: number | null;
  yPosition: number | null;
  resolvedAt: Date | null;
  createdAt: Date;
};

export async function loadReviewPageData(token: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    include: {
      project: {
        select: {
          name: true,
          clientName: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          deliveries: {
            orderBy: { versionNumber: "desc" },
            select: {
              id: true,
              reviewToken: true,
              versionNumber: true,
              label: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!delivery) return null;

  const branding = delivery.project.user?.id
    ? await getFreelancerBrandingByUserId(delivery.project.user.id)
    : null;

  const signedUrl = await getSignedUrl(delivery.filePath, 60 * 60 * 2);

  const [resolvedAtColumn] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Comment'
        AND column_name = 'resolvedAt'
    ) as "exists"
  `;

  const [audioUrlColumn] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Comment'
        AND column_name = 'audioUrl'
    ) as "exists"
  `;

  const [parentIdColumn] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Comment'
        AND column_name = 'parentId'
    ) as "exists"
  `;

  const hasResolvedAtColumn = resolvedAtColumn?.exists === true;
  const hasAudioUrlColumn = audioUrlColumn?.exists === true;
  const hasParentIdColumn = parentIdColumn?.exists === true;

  let comments: CommentRow[];

  if (hasResolvedAtColumn) {
    if (hasAudioUrlColumn) {
      comments = hasParentIdColumn
        ? await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "parentId",
              "authorType",
              "authorName",
              "content",
              "audioUrl",
              "xPosition",
              "yPosition",
              "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `
        : await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "authorType",
              "authorName",
              "content",
              "audioUrl",
              "xPosition",
              "yPosition",
              "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `;
    } else {
      comments = hasParentIdColumn
        ? await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "parentId",
              "authorType",
              "authorName",
              "content",
              "xPosition",
              "yPosition",
              "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `
        : await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "authorType",
              "authorName",
              "content",
              "xPosition",
              "yPosition",
              "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `;
    }
  } else {
    if (hasAudioUrlColumn) {
      comments = hasParentIdColumn
        ? await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "parentId",
              "authorType",
              "authorName",
              "content",
              "audioUrl",
              "xPosition",
              "yPosition",
              NULL::timestamp as "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `
        : await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "authorType",
              "authorName",
              "content",
              "audioUrl",
              "xPosition",
              "yPosition",
              NULL::timestamp as "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `;
    } else {
      comments = hasParentIdColumn
        ? await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "parentId",
              "authorType",
              "authorName",
              "content",
              "xPosition",
              "yPosition",
              NULL::timestamp as "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `
        : await prisma.$queryRaw<CommentRow[]>`
            SELECT
              "id",
              "authorType",
              "authorName",
              "content",
              "xPosition",
              "yPosition",
              NULL::timestamp as "resolvedAt",
              "createdAt"
            FROM "Comment"
            WHERE "deliveryId" = ${delivery.id}
            ORDER BY "createdAt" ASC
          `;
    }
  }

  const initialComments: CommentData[] = comments.map((comment) => ({
    id: comment.id,
    parentId: comment.parentId ?? null,
    authorType: comment.authorType,
    authorName: comment.authorName,
    content: comment.content,
    audioUrl: comment.audioUrl ?? null,
    xPosition: comment.xPosition,
    yPosition: comment.yPosition,
    resolvedAt: comment.resolvedAt?.toISOString() ?? null,
    createdAt: comment.createdAt.toISOString(),
  }));

  const allDeliveries = delivery.project.deliveries.map((item) => ({
    id: item.id,
    reviewToken: item.reviewToken,
    versionNumber: item.versionNumber,
    label: item.label,
    status: item.status as Status,
    createdAt: item.createdAt.toISOString(),
  }));

  return {
    delivery,
    signedUrl,
    initialComments,
    allDeliveries,
    branding,
  };
}
