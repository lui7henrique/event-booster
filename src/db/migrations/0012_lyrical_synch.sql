ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_referral_link_id_referral_links_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "referral_link_id";