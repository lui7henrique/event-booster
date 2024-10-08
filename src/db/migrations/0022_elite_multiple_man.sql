ALTER TABLE "referral_links" RENAME COLUMN "referral_link" TO "link";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "referral_link_id" TO "referral_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_referral_link_id_referral_links_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_referral_id_referral_links_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referral_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
