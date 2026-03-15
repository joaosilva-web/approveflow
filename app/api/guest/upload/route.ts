import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/supabase";
import { randomBytes } from "crypto";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_PREFIXES = ["image/", "video/", "application/pdf"];

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 20 MB." },
      { status: 413 },
    );
  }

  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload an image, PDF, or video." },
      { status: 415 },
    );
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop()! : "";
  const safeFileName = randomBytes(8).toString("hex") + (ext ? `.${ext}` : "");
  const filePath = `guest/${randomBytes(16).toString("hex")}/${safeFileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadFile(filePath, buffer, file.type).catch(() => {
    throw new Error("Upload failed");
  });

  const reviewToken = randomBytes(24).toString("hex");
  const claimToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.guestUpload.create({
    data: {
      filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      reviewToken,
      claimToken,
      expiresAt,
    },
  });

  const origin =
    request.nextUrl.origin !== "null" ? request.nextUrl.origin : "";
  const reviewUrl = `${origin}/r/${reviewToken}`;

  return NextResponse.json({ reviewToken, claimToken, reviewUrl });
}
