import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId } = body as { projectId?: string };
    if (!projectId) return NextResponse.json({ ok: false, error: "missing projectId" }, { status: 400 });

    await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
