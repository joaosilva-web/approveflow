import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const commentSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorType: z.enum(["CLIENT", "FREELANCER"]).optional().default("CLIENT"),
  parentId: z.string().min(1).optional().nullable(),
  content: z.string().min(1).max(2000),
  xPosition: z.number().min(0).max(1).optional().nullable(),
  yPosition: z.number().min(0).max(1).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const upload = await prisma.guestUpload.findUnique({
    where: { reviewToken: token },
    select: { id: true, expiresAt: true },
  });

  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (upload.expiresAt < new Date()) {
    return NextResponse.json({ error: "Review link expired" }, { status: 410 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  let parentId: string | null = null;

  if (parsed.data.parentId) {
    const parentComment = await prisma.guestComment.findFirst({
      where: {
        id: parsed.data.parentId,
        guestUploadId: upload.id,
      },
      select: { id: true },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 400 },
      );
    }

    parentId = parentComment.id;
  }

  const comment = await prisma.guestComment.create({
    data: {
      guestUploadId: upload.id,
      authorType: parsed.data.authorType,
      authorName: parsed.data.authorName,
      content: parsed.data.content,
      xPosition: parsed.data.xPosition ?? null,
      yPosition: parsed.data.yPosition ?? null,
    },
  });

  if (parentId) {
    try {
      await prisma.$executeRaw`
        UPDATE "GuestComment"
        SET "parentId" = ${parentId}
        WHERE id = ${comment.id}
      `;
    } catch (err) {
      // ignore
    }
  }

  return NextResponse.json({
    id: comment.id,
    authorType: comment.authorType,
    authorName: comment.authorName,
    content: comment.content,
    parentId: parentId,
    xPosition: comment.xPosition,
    yPosition: comment.yPosition,
    resolvedAt: null,
    createdAt: comment.createdAt.toISOString(),
  });
}
