import React from "react";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { loadReviewPageData } from "@/features/review/server/loadReviewPageData";
import ReviewClientShell from "@/features/review/components/ReviewClientShell";
import PasswordGate from "@/features/review/components/PasswordGate";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string; token: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    select: { project: { select: { name: true } } },
  });

  return {
    title: delivery
      ? `Review: ${delivery.project?.name ?? "Review"} - ApproveFlow`
      : "Review - ApproveFlow",
    robots: { index: false },
  };
}

export default async function BrandedReviewPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, token } = await params;
  const { preview } = await searchParams;
  const isFreelancerPreview = preview === "1";

  let freelancerName: string | null = null;
  if (isFreelancerPreview) {
    const session = await auth();
    freelancerName =
      session?.user?.name ?? session?.user?.email ?? "Freelancer";
  }

  const pageData = await loadReviewPageData(token);
  if (!pageData) notFound();

  const { delivery, signedUrl, initialComments, allDeliveries, branding } =
    pageData;

  if (!branding?.slug || branding.slug !== slug) {
    notFound();
  }

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

  if (delivery.password && !isFreelancerPreview) {
    const cookieStore = await cookies();
    const unlocked = cookieStore.get(`review_pw_${token}`)?.value === "1";
    if (!unlocked) {
      return (
        <PasswordGate
          token={token}
          projectName={delivery.project?.name ?? ""}
          branding={branding}
        />
      );
    }
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = headersList.get("user-agent") ?? null;

  prisma.view
    .create({ data: { deliveryId: delivery.id, ipAddress: ip, userAgent } })
    .catch(() => {});

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
      branding={branding}
      reviewPathSlug={slug}
    />
  );
}
