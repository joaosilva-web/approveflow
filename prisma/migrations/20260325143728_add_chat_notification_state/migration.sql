-- CreateTable
CREATE TABLE "ChatNotificationState" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "hasPendingNotification" BOOLEAN NOT NULL DEFAULT false,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatNotificationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatNotificationState_deliveryId_key" ON "ChatNotificationState"("deliveryId");

-- AddForeignKey
ALTER TABLE "ChatNotificationState" ADD CONSTRAINT "ChatNotificationState_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
