ALTER TABLE "referral_links" ADD COLUMN "parent_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_parent_id_referral_links_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."referral_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
