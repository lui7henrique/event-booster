ALTER TABLE "referral_links" DROP CONSTRAINT "referral_links_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "referral_links" DROP COLUMN IF EXISTS "event_id";