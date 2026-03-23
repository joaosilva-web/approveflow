ALTER TABLE "Comment"
ADD COLUMN "parentId" TEXT;

ALTER TABLE "GuestComment"
ADD COLUMN "parentId" TEXT;

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Comment"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "GuestComment"
ADD CONSTRAINT "GuestComment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "GuestComment"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "GuestComment_parentId_idx" ON "GuestComment"("parentId");
