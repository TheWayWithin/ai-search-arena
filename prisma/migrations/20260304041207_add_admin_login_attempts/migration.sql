-- CreateTable
CREATE TABLE "admin_login_attempts" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_attempt" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_login_attempts_identifier_key" ON "admin_login_attempts"("identifier");
