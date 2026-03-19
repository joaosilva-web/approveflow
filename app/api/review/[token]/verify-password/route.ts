import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const password: string =
    typeof body.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const delivery = await prisma.delivery.findUnique({
    where: { reviewToken: token },
    select: { password: true, expiresAt: true },
  });

  if (!delivery || !delivery.password) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (delivery.expiresAt && delivery.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  const valid = await bcrypt.compare(password, delivery.password);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Set a short-lived httpOnly cookie scoped to this token
  const response = NextResponse.json({ ok: true });
  response.cookies.set(`review_pw_${token}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: `/review/${token}`,
    maxAge: 60 * 60 * 4, // 4 hours
  });

  return response;
}
