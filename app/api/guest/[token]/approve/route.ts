import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const schema = z.object({
  signerName: z.string().min(1).max(100),
  signerEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const upload = await prisma.guestUpload.findUnique({
    where: { reviewToken: token },
    select: { id: true, status: true, expiresAt: true },
  });

  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (upload.expiresAt < new Date()) {
    return NextResponse.json({ error: "Review link expired" }, { status: 410 });
  }

  if (upload.status === "APPROVED") {
    return NextResponse.json({ error: "Already approved" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  await prisma.guestUpload.update({
    where: { id: upload.id },
    data: { status: "APPROVED" },
  });

  return NextResponse.json({ ok: true });
}
