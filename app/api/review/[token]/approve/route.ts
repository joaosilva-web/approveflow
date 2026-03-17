import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendApprovalEmail } from "@/lib/email";

const approveSchema = z.object({
  signerName: z.string().min(1).max(100),
  signerEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
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
          user: { select: { email: true, locale: true } },
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
    return NextResponse.json({ error: "Already approved" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  await prisma.$transaction([
    prisma.delivery.update({
      where: { id: delivery.id },
      data: { status: "APPROVED" },
    }),
    prisma.approval.upsert({
      where: { deliveryId: delivery.id },
      create: {
        deliveryId: delivery.id,
        signerName: parsed.data.signerName,
        signerEmail: parsed.data.signerEmail || null,
        ipAddress: ip,
      },
      update: {
        signerName: parsed.data.signerName,
        signerEmail: parsed.data.signerEmail || null,
        ipAddress: ip,
      },
    }),
  ]);

  // Notify freelancer (fire & forget)
  const ownerEmail = delivery.project.user?.email;
  if (ownerEmail) {
    sendApprovalEmail({
      to: ownerEmail,
      projectName: delivery.project.name,
      clientName: delivery.project.clientName,
      signerName: parsed.data.signerName,
      deliveryId: delivery.id,
      locale: (delivery.project.user?.locale as "pt" | "en") ?? "pt",
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
