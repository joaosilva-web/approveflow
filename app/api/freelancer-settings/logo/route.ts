import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFreelancerLogoPath } from "@/lib/freelancer-branding";
import { uploadFile, deleteFile } from "@/lib/supabase/server";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Selecione uma imagem para a logo." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "A logo deve ser uma imagem." },
      { status: 400 },
    );
  }

  if (file.size > MAX_LOGO_SIZE) {
    return NextResponse.json(
      { error: "A logo deve ter no máximo 2 MB." },
      { status: 400 },
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const storagePath = `${session.user.id}/branding/${Date.now()}-${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadFile(storagePath, buffer, file.type);

  const currentLogoPath = await getFreelancerLogoPath(session.user.id);
  if (currentLogoPath) {
    deleteFile(currentLogoPath).catch(() => {});
  }

  return NextResponse.json({ logoUrl: storagePath });
}

