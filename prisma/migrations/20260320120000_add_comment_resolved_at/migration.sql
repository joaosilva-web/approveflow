ALTER TABLE "Comment"
ADD COLUMN "resolvedAt" TIMESTAMP(3);

ALTER TABLE "GuestComment"
ADD COLUMN "resolvedAt" TIMESTAMP(3);
