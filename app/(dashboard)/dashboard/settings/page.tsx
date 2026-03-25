import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getFreelancerBrandingByUserId } from "@/lib/freelancer-branding";
import { getSubscriptionInfo } from "@/features/billing/subscription";
import SettingsPageClient from "./SettingsPageClient";

export const metadata: Metadata = {
  title: "Configurações - ApproveFlow",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const branding = await getFreelancerBrandingByUserId(session.user.id);
  const subscription = await getSubscriptionInfo(session.user.id);

  return (
    <SettingsPageClient
      initialSettings={branding}
      fallbackName={session.user.name ?? session.user.email ?? "Freelancer"}
      subscriptionPlan={subscription.planCode}
    />
  );
}
