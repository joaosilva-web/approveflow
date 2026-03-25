import { prisma } from "@/lib/prisma/client";
import { sendCommentNotificationEmail } from "@/lib/email";
import { getFreelancerBrandingByUserId } from "@/lib/freelancer-branding";

type Locale = "pt" | "en";

interface DeliveryContext {
  deliveryId: string;
  reviewToken: string;
  project: {
    name: string;
    userId: string;
    user: {
      email: string;
      locale: string | null;
    } | null;
  };
}

/**
 * Handles notification logic when a CLIENT sends a message.
 * - If no pending notification → sends email and marks pending
 * - If pending notification exists → only increments unread count
 */
export async function handleClientMessage(
  delivery: DeliveryContext,
  authorName: string,
  content: string,
): Promise<void> {
  const ownerEmail = delivery.project.user?.email;
  if (!ownerEmail) return;

  const state = await prisma.chatNotificationState.upsert({
    where: { deliveryId: delivery.deliveryId },
    create: {
      deliveryId: delivery.deliveryId,
      hasPendingNotification: true,
      unreadCount: 1,
      lastNotifiedAt: new Date(),
    },
    update: {
      unreadCount: { increment: 1 },
    },
  });

  // Email was already sent for this cycle — just increment count
  if (state.hasPendingNotification && state.unreadCount > 1) {
    return;
  }

  // First message in this cycle — mark as pending and send email
  await prisma.chatNotificationState.update({
    where: { deliveryId: delivery.deliveryId },
    data: {
      hasPendingNotification: true,
      lastNotifiedAt: new Date(),
    },
  });

  const branding = await getFreelancerBrandingByUserId(
    delivery.project.userId,
  );
  const locale = (delivery.project.user?.locale as Locale) ?? "pt";

  await sendCommentNotificationEmail({
    to: ownerEmail,
    projectName: delivery.project.name,
    reviewToken: delivery.reviewToken,
    authorName,
    comment: content,
    unreadCount: 1,
    freelancerSlug: branding.slug,
    locale,
  });
}

/**
 * Handles notification state reset when a FREELANCER responds.
 * Resets the pending flag and unread counter, allowing a new notification cycle.
 */
export async function handleFreelancerResponse(
  deliveryId: string,
): Promise<void> {
  await prisma.chatNotificationState.upsert({
    where: { deliveryId },
    create: {
      deliveryId,
      hasPendingNotification: false,
      unreadCount: 0,
    },
    update: {
      hasPendingNotification: false,
      unreadCount: 0,
    },
  });
}
