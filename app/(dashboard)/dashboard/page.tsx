import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionInfo } from "@/lib/billing/subscription";
import type { Metadata } from "next";
import DashboardPageClient from "@/app/(dashboard)/dashboard/DashboardPageClient";

export const metadata: Metadata = {
  title: "Projects — ApproveFlow",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryRow = {
  id: string;
  status: string;
  createdAt: Date;
  views: { createdAt: Date }[];
};

type ProjectRow = {
  id: string;
  name: string;
  clientName: string | null;
  clientEmail: string | null;
  updatedAt: Date;
  deliveries: DeliveryRow[];
};

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
    }) as Promise<ProjectRow[]>,
    getSubscriptionInfo(session.user.id),
  ]);

  const subscription = {
    planCode: subscriptionInfo.planCode,
    maxProjects: subscriptionInfo.maxProjects,
    projectCount: subscriptionInfo.projectCount,
  };

  const totalProjects = projects.length;
  let totalPending = 0;
  let totalApproved = 0;
  let totalChanges = 0;
  for (const p of projects) {
    totalPending += (p.deliveries as DeliveryRow[]).filter(
      (d: DeliveryRow) => d.status === "PENDING",
    ).length;
    totalApproved += (p.deliveries as DeliveryRow[]).filter(
      (d: DeliveryRow) => d.status === "APPROVED",
    ).length;
    totalChanges += (p.deliveries as DeliveryRow[]).filter(
      (d: DeliveryRow) => d.status === "CHANGES_REQUESTED",
    ).length;
  }

  const projectData = projects.map((p: ProjectRow) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName ?? "",
    clientEmail: p.clientEmail ?? "",
    totalDeliveries: p.deliveries.length,
    latestStatus: ((p.deliveries as DeliveryRow[])[0]?.status ?? null) as
      | "PENDING"
      | "APPROVED"
      | "CHANGES_REQUESTED"
      | null,
    updatedAt: p.updatedAt,
    lastViewedAt:
      (p.deliveries as DeliveryRow[])
        .flatMap((d: DeliveryRow) => d.views)
        .sort(
          (a: { createdAt: Date }, b: { createdAt: Date }) =>
            b.createdAt.getTime() - a.createdAt.getTime(),
        )[0]?.createdAt ?? null,
  }));

  return (
    <DashboardPageClient
      stats={{ totalProjects, totalPending, totalApproved, totalChanges }}
      projects={projectData}
      subscription={subscription}
    />
  );
}
