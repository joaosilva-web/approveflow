import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import ProjectDetailClient from "@/app/(dashboard)/dashboard/projects/[id]/ProjectDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project — ApproveFlow",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      deliveries: {
        orderBy: { versionNumber: "desc" },
        include: {
          _count: { select: { comments: true, views: true } },
          views: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const deliveries = project.deliveries.map((d) => ({
    id: d.id,
    versionNumber: d.versionNumber,
    label: d.label,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    status: d.status as "PENDING" | "APPROVED" | "CHANGES_REQUESTED",
    reviewToken: d.reviewToken,
    commentCount: d._count.comments,
    viewCount: d._count.views,
    createdAt: d.createdAt,
    lastViewedAt: d.views[0]?.createdAt ?? null,
  }));

  return (
    <ProjectDetailClient
      projectId={id}
      projectName={project.name}
      clientName={project.clientName}
      clientEmail={project.clientEmail}
      deliveries={deliveries}
    />
  );
}
