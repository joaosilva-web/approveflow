import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
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
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    clientName: project.clientName ?? "",
    clientEmail: project.clientEmail ?? "",
    totalDeliveries: project.deliveries.length,
    latestStatus: (project.deliveries[0]?.status ?? null) as
      | "PENDING"
      | "APPROVED"
      | "CHANGES_REQUESTED"
      | null,
    updatedAt: project.updatedAt,
    lastViewedAt:
      project.deliveries
        .flatMap((d) => d.views)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        ?.createdAt ?? null,
  });
}
