import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionInfo } from "@/lib/billing/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — ApproveFlow",
};

// Since this page is a Server Component, modal open state lives in _client.tsx
import DashboardPageClient from "@/app/(dashboard)/dashboard/_client";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [projects, subscriptionInfo] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            views: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { createdAt: true },
            },
          },
        },
      },
    }),
    getSubscriptionInfo(session.user.id),
  ]);

  const subscription = {
    planCode: subscriptionInfo.planCode,
    maxProjects: subscriptionInfo.maxProjects,
    projectCount: subscriptionInfo.projectCount,
  };

  const totalProjects = projects.length;
  const totalPending = projects.reduce(
    (n: number, p) => n + p.deliveries.filter((d) => d.status === "PENDING").length,
    0,
  );
  const totalApproved = projects.reduce(
    (n: number, p) => n + p.deliveries.filter((d) => d.status === "APPROVED").length,
    0,
  );
  const totalChanges = projects.reduce(
    (n: number, p) =>
      n + p.deliveries.filter((d) => d.status === "CHANGES_REQUESTED").length,
    0,
  );

  const projectData = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    totalDeliveries: p.deliveries.length,
    latestStatus: (p.deliveries[0]?.status ?? null) as
      | "PENDING"
      | "APPROVED"
      | "CHANGES_REQUESTED"
      | null,
    updatedAt: p.updatedAt,
    lastViewedAt:
      p.deliveries
        .flatMap((d) => d.views)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        ?.createdAt ?? null,
  }));

  return (
    <DashboardPageClient
      stats={{ totalProjects, totalPending, totalApproved, totalChanges }}
      projects={projectData}
      subscription={subscription}
    />
  );
}
