import React from "react";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client";
import { auth } from "@/auth";
import { getSignedUrl } from "@/lib/supabase/server";
import ReviewClientShell from "@/features/review/components/ReviewClientShell";
import PasswordGate from "@/features/review/components/PasswordGate";
import type { Metadata } from "next";
import type { CommentData } from "@/features/review/components/CommentSystem";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    select: { fileName: true, project: { select: { name: true } } },
  });

  if (!delivery) return { title: "Review — ApproveFlow" };

  return {
    title: `Review: ${delivery.project.name} — ApproveFlow`,
    robots: { index: false },
  };
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { preview } = await searchParams;
  const isFreelancerPreview = preview === "1";

  // In preview mode, verify the viewer is a logged-in freelancer
  let freelancerName: string | null = null;
  if (isFreelancerPreview) {
    const session = await auth();
    freelancerName =
      session?.user?.name ?? session?.user?.email ?? "Freelancer";
  }

  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    include: {
      project: {
        select: {
          name: true,
          clientName: true,
          user: { select: { name: true } },
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

  if (!delivery) notFound();

  // Check if link has expired
  if (delivery.expiresAt && delivery.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
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
          <p className="text-sm text-white/50">
            This review link has expired. Contact the sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Check password protection (skip in freelancer preview mode)
  if (delivery.password && !isFreelancerPreview) {
    const cookieStore = await cookies();
    const unlocked = cookieStore.get(`review_pw_${token}`)?.value === "1";
    if (!unlocked) {
      return <PasswordGate token={token} projectName={delivery.project.name} />;
    }
  }

  // Record view (fire & forget — don't block page render)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = headersList.get("user-agent") ?? null;

  prisma.view
    .create({ data: { deliveryId: delivery.id, ipAddress: ip, userAgent } })
    .catch(() => {
      /* silently ignore */
    });

  // Generate signed download/preview URL (2 hours)
  let signedUrl: string;
  try {
    signedUrl = await getSignedUrl(delivery.filePath, 60 * 60 * 2);
  } catch {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
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

  const [resolvedAtColumn] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Comment'
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
      FROM "Comment"
      WHERE "deliveryId" = ${delivery.id}
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
      FROM "Comment"
      WHERE "deliveryId" = ${delivery.id}
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

  const allDeliveries = delivery.project.deliveries.map((d) => ({
    id: d.id,
    reviewToken: d.reviewToken,
    versionNumber: d.versionNumber,
    label: d.label,
    status: d.status as "PENDING" | "APPROVED" | "CHANGES_REQUESTED",
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <ReviewClientShell
      token={token}
      deliveryId={delivery.id}
      signedUrl={signedUrl}
      fileName={delivery.fileName}
      mimeType={delivery.mimeType}
      allowDownload={delivery.allowDownload}
      initialStatus={
        delivery.status as "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
      }
      versionNumber={delivery.versionNumber}
      label={delivery.label}
      projectName={delivery.project.name}
      clientName={delivery.project.clientName}
      initialComments={initialComments}
      allDeliveries={allDeliveries}
      isFreelancerPreview={isFreelancerPreview}
      freelancerName={freelancerName}
      freelancerDisplayName={delivery.project.user?.name ?? null}
    />
  );
}
