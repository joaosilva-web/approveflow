import { NextResponse } from "next/server";
import { getFreelancerBrandingBySlug } from "@/lib/freelancer-branding";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const branding = await getFreelancerBrandingBySlug(slug);

  if (!branding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(branding);
}
