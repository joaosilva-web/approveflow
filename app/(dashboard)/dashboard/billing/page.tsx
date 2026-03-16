import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSubscriptionInfo } from "@/lib/billing/subscription";
import { PLANS } from "@/lib/billing/plans";
import BillingPageClient from "./_client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing — ApproveFlow",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function BillingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status } = await searchParams;
  const subscription = await getSubscriptionInfo(session.user.id);

  return (
    <BillingPageClient
      subscription={subscription}
      plans={[
        PLANS.free,
        PLANS.pro,
        PLANS.studio,
      ]}
      statusParam={status}
      userEmail={session.user.email ?? ""}
    />
  );
}
