-- Newsletter: each subscriber's language and private unsubscribe key; per-article email status.

-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "locale" "Locale" NOT NULL DEFAULT 'en',
ADD COLUMN     "token" TEXT;

-- Existing subscribers get a random unsubscribe key.
UPDATE "Subscriber" SET "token" = replace(gen_random_uuid()::text, '-', '') WHERE "token" IS NULL;
ALTER TABLE "Subscriber" ALTER COLUMN "token" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_token_key" ON "Subscriber"("token");

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "emailSubscribers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newsletterError" TEXT,
ADD COLUMN     "newsletterFailed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newsletterSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newsletterSentAt" TIMESTAMP(3);

-- Articles already published before this change count as emailed: no surprise mass email of old articles.
UPDATE "Post" SET "newsletterSentAt" = COALESCE("publishedAt", CURRENT_TIMESTAMP) WHERE "status" = 'PUBLISHED';
