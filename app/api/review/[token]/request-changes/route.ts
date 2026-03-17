import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendChangesRequestedEmail } from "@/lib/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      reviewToken: true,
      project: {
        select: {
          name: true,
          clientName: true,
          user: { select: { email: true } },
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

  await prisma.delivery.update({
    where: { id: delivery.id },
    data: { status: "CHANGES_REQUESTED" },
  });

  // Notify freelancer (fire & forget)
  const ownerEmail = delivery.project.user?.email;
  if (ownerEmail) {
    sendChangesRequestedEmail({
      to: ownerEmail,
      projectName: delivery.project.name,
      clientName: delivery.project.clientName,
      reviewToken: delivery.reviewToken,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
