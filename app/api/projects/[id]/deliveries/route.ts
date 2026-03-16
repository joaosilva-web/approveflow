import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deliveries = await prisma.delivery.findMany({
    where: { projectId },
    orderBy: { versionNumber: "desc" },
    select: {
      id: true,
      versionNumber: true,
      label: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      status: true,
      reviewToken: true,
      createdAt: true,
      _count: {
        select: { comments: true, views: true },
      },
      views: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const result = deliveries.map((d) => ({
    id: d.id,
    versionNumber: d.versionNumber,
    label: d.label,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    status: d.status,
    reviewToken: d.reviewToken,
    commentCount: d._count.comments,
    viewCount: d._count.views,
    createdAt: d.createdAt,
    lastViewedAt: d.views[0]?.createdAt ?? null,
  }));

  return NextResponse.json(result);
}
