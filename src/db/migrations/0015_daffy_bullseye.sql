ALTER TABLE "referral_links" ADD COLUMN "subscription_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_links" DROP COLUMN IF EXISTS "conversion_rate";