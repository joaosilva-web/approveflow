-- CreateTable
CREATE TABLE "GuestUpload" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "reviewToken" TEXT NOT NULL,
    "claimToken" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestComment" (
    "id" TEXT NOT NULL,
    "guestUploadId" TEXT NOT NULL,
    "authorType" "AuthorType" NOT NULL DEFAULT 'CLIENT',
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "xPosition" DOUBLE PRECISION,
    "yPosition" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestView" (
    "id" TEXT NOT NULL,
    "guestUploadId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestUpload_reviewToken_key" ON "GuestUpload"("reviewToken");

-- CreateIndex
CREATE UNIQUE INDEX "GuestUpload_claimToken_key" ON "GuestUpload"("claimToken");

-- AddForeignKey
ALTER TABLE "GuestComment" ADD CONSTRAINT "GuestComment_guestUploadId_fkey" FOREIGN KEY ("guestUploadId") REFERENCES "GuestUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestView" ADD CONSTRAINT "GuestView_guestUploadId_fkey" FOREIGN KEY ("guestUploadId") REFERENCES "GuestUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
