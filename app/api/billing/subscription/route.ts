import { auth } from "@/auth";
import { getSubscriptionInfo } from "@/features/billing/subscription";
import { NextResponse } from "next/server";

/**
 * GET /api/billing/subscription
 * Returns the caller's current subscription state and usage.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const info = await getSubscriptionInfo(session.user.id);
    return NextResponse.json(info);
  } catch (err) {
    console.error("[billing/subscription] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
