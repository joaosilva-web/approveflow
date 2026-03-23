CREATE TABLE "FreelancerSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#7C3AED',
    "secondaryColor" TEXT NOT NULL DEFAULT '#4F46E5',
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FreelancerSettings_userId_key" ON "FreelancerSettings"("userId");
CREATE UNIQUE INDEX "FreelancerSettings_slug_key" ON "FreelancerSettings"("slug");

ALTER TABLE "FreelancerSettings"
ADD CONSTRAINT "FreelancerSettings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
