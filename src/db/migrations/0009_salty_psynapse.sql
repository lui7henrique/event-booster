ALTER TABLE "referral_links" ADD COLUMN "event_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
