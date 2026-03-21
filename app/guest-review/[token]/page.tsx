import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { getSignedUrl } from "@/lib/supabase/server";
import GuestReviewShell from "@/features/guest-review/components/GuestReviewShell";
import type { CommentData } from "@/features/review/components/CommentSystem";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const upload = await prisma.guestUpload.findUnique({
    where: { reviewToken: token },
    select: { fileName: true },
  });

  return {
    title: upload
      ? `Review: ${upload.fileName} — ApproveFlow`
      : "Review — ApproveFlow",
    robots: { index: false },
  };
}

export default async function GuestReviewPage({ params }: PageProps) {
  const { token } = await params;

  const upload = await prisma.guestUpload.findUnique({
    where: { reviewToken: token },
  });

  if (!upload) notFound();

  // Expired link
  if (upload.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-[#06060f] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/30"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link expired</h1>
          <p className="text-sm text-white/50 mb-6">
            This guest review link has expired. Create a free account for
            permanent review links.
          </p>
          <a
            href="/design-review-tool"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            Create a new review link
          </a>
        </div>
      </div>
    );
  }

  // Record view (fire & forget)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = headersList.get("user-agent") ?? null;
  prisma.guestView
    .create({ data: { guestUploadId: upload.id, ipAddress: ip, userAgent } })
    .catch(() => {});

  // Signed URL
  let signedUrl: string;
  try {
    signedUrl = await getSignedUrl(upload.filePath, 60 * 60 * 2);
  } catch {
    return (
      <div className="min-h-screen bg-[#06060f] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-white mb-2">
            File unavailable
          </h1>
          <p className="text-sm text-white/50">
            The file could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const [resolvedAtColumn] = await prisma.$queryRaw<
    Array<{ exists: boolean }>
  >`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'GuestComment'
        AND column_name = 'resolvedAt'
    ) as "exists"
  `;

  const hasResolvedAtColumn = resolvedAtColumn?.exists === true;

  let comments: Array<{
    id: string;
    authorType: "CLIENT" | "FREELANCER";
    authorName: string;
    content: string;
    xPosition: number | null;
    yPosition: number | null;
    resolvedAt: Date | null;
    createdAt: Date;
  }>;

  if (hasResolvedAtColumn) {
    comments = await prisma.$queryRaw<
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
      FROM "GuestComment"
      WHERE "guestUploadId" = ${upload.id}
      ORDER BY "createdAt" ASC
    `;
  } else {
    comments = await prisma.$queryRaw<
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
        NULL::timestamp as "resolvedAt",
        "createdAt"
      FROM "GuestComment"
      WHERE "guestUploadId" = ${upload.id}
      ORDER BY "createdAt" ASC
    `;
  }

  const initialComments: CommentData[] = comments.map((c) => ({
    id: c.id,
    authorType: c.authorType,
    authorName: c.authorName,
    content: c.content,
    xPosition: c.xPosition,
    yPosition: c.yPosition,
    resolvedAt: c.resolvedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <GuestReviewShell
      token={token}
      deliveryId={upload.id}
      signedUrl={signedUrl}
      fileName={upload.fileName}
      mimeType={upload.mimeType}
      initialStatus={
        upload.status as "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
      }
      initialComments={initialComments}
      expiresAt={upload.expiresAt.toISOString()}
    />
  );
}
