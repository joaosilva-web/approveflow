import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { sendChangesRequestedEmail } from "@/lib/email";
import { getFreelancerBrandingByUserId } from "@/lib/freelancer-branding";

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
          userId: true,
          user: {
            select: {
              email: true,
              locale: true,
            },
          },
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

  if (delivery.status === "APPROVED") {
    return NextResponse.json(
      { error: "Esta versão já foi aprovada e não pode ser modificada." },
      { status: 409 },
    );
  }

  await prisma.delivery.update({
    where: { id: delivery.id },
    data: { status: "CHANGES_REQUESTED" },
  });

  const ownerEmail = delivery.project.user?.email;
  if (ownerEmail) {
    const branding = await getFreelancerBrandingByUserId(delivery.project.userId);
    sendChangesRequestedEmail({
      to: ownerEmail,
      projectName: delivery.project.name,
      clientName: delivery.project.clientName,
      reviewToken: delivery.reviewToken,
      freelancerSlug: branding.slug,
      locale: (delivery.project.user?.locale as "pt" | "en") ?? "pt",
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}

