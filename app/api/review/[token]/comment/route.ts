import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { sendCommentNotificationEmail } from "@/lib/email";
import { z } from "zod";

const commentSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional().or(z.literal("")),
  authorType: z.enum(["CLIENT", "FREELANCER"]).optional().default("CLIENT"),
  parentId: z.string().min(1).optional().nullable(),
  content: z.string().max(2000).optional(),
  audioUrl: z.string().url().optional(),
  // Normalized image coordinates (0-1). null = general comment
  xPosition: z.number().min(0).max(1).optional().nullable(),
  yPosition: z.number().min(0).max(1).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    select: {
      id: true,
      expiresAt: true,
      project: {
        select: {
          id: true,
          name: true,
          user: {
            select: {
              email: true,
              locale: true,
            },
          },
        },
      },
    },
  });

  if (!delivery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (delivery.expiresAt && delivery.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  // Either content or audioUrl must be provided
  if (!parsed.data.content && !parsed.data.audioUrl) {
    return NextResponse.json(
      { error: "Either content or audioUrl is required" },
      { status: 400 },
    );
  }

  let comment: {
    id: string;
    parentId: string | null;
    authorType: "CLIENT" | "FREELANCER";
    authorName: string;
    content: string;
    audioUrl: string | null;
    xPosition: number | null;
    yPosition: number | null;
    createdAt: Date;
  };
  try {
    let parentId: string | null = null;

    if (parsed.data.parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parsed.data.parentId,
          deliveryId: delivery.id,
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

    comment = await prisma.comment.create({
      data: {
        deliveryId: delivery.id,
        parentId,
        authorType: parsed.data.authorType,
        authorName: parsed.data.authorName,
        authorEmail: parsed.data.authorEmail || null,
        content: parsed.data.content ?? "",
        audioUrl: parsed.data.audioUrl ?? null,
        xPosition: parsed.data.xPosition ?? null,
        yPosition: parsed.data.yPosition ?? null,
      } as unknown as Parameters<typeof prisma.comment.create>[0]["data"],
    });
  } catch (err: unknown) {
    console.error("Comment create failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Comment create failed",
      },
      { status: 500 },
    );
  }

  if (comment.authorType === "CLIENT") {
    const ownerEmail = delivery.project.user?.email;
    if (ownerEmail) {
      sendCommentNotificationEmail({
        to: ownerEmail,
        projectName: delivery.project.name,
        reviewToken: token,
        authorName: comment.authorName,
        comment: comment.content,
        locale: (delivery.project.user?.locale as "pt" | "en") ?? "pt",
      }).catch(console.error);
    }
  }

  return NextResponse.json({
    id: comment.id,
    authorType: comment.authorType,
    authorName: comment.authorName,
    content: comment.content,
    audioUrl: comment.audioUrl,
    parentId: comment.parentId,
    xPosition: comment.xPosition,
    yPosition: comment.yPosition,
    resolvedAt: null,
    createdAt: comment.createdAt.toISOString(),
  });
}
