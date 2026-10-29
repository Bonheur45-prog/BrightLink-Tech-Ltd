-- Google Analytics 4 measurement ID, set in CMS → Site settings (empty = no analytics).
ALTER TABLE "SiteSettings" ADD COLUMN "googleAnalyticsId" TEXT NOT NULL DEFAULT '';
