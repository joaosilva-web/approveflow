import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";

const resolveSchema = z.object({
  resolved: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ token: string; commentId: string }>;
  },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, commentId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = resolveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    select: {
      id: true,
      project: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!delivery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (delivery.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      deliveryId: delivery.id,
    },
    select: {
      id: true,
      authorType: true,
    },
  });

  if (!existingComment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (existingComment.authorType !== "CLIENT") {
    return NextResponse.json(
      { error: "Only client comments can be resolved" },
      { status: 400 },
    );
  }

  const [resolvedAtColumn] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Comment'
        AND column_name = 'resolvedAt'
    ) as "exists"
  `;

  if (resolvedAtColumn?.exists !== true) {
    return NextResponse.json(
      {
        error:
          "O campo de comentário resolvido ainda não está disponível no banco. Aplique a migration para habilitar essa ação.",
      },
      { status: 409 },
    );
  }

  await prisma.$executeRaw`
    UPDATE "Comment"
    SET "resolvedAt" = ${parsed.data.resolved ? new Date() : null}
    WHERE "id" = ${existingComment.id}
  `;

  const [comment] = await prisma.$queryRaw<
    Array<{
      id: string;
      authorType: "CLIENT" | "FREELANCER";
      authorName: string;
      content: string;
      xPosition: number | null;
      yPosition: number | null;
      resolvedAt: Date | null;
      createdAt: Date;
    }>
  >`
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
    WHERE "id" = ${existingComment.id}
    LIMIT 1
  `;

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: comment.id,
    authorType: comment.authorType,
    authorName: comment.authorName,
    content: comment.content,
    xPosition: comment.xPosition,
    yPosition: comment.yPosition,
    resolvedAt: comment.resolvedAt?.toISOString() ?? null,
    createdAt: comment.createdAt.toISOString(),
  });
}
