-- Add audioUrl to Comment and GuestComment
ALTER TABLE "Comment"
ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;

ALTER TABLE "GuestComment"
ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;
