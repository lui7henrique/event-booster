ALTER TABLE "referral_links" ALTER COLUMN "click_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_links" ADD COLUMN "conversion_rate" double precision DEFAULT 0;