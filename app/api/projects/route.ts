import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
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
  });

  const data = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName ?? "",
    clientEmail: p.clientEmail ?? "",
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

  return NextResponse.json(data);
}
