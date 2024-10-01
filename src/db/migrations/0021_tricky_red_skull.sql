ALTER TABLE "companies" RENAME TO "hosts";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "company_id" TO "host_id";--> statement-breakpoint
ALTER TABLE "hosts" DROP CONSTRAINT "companies_email_unique";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_company_id_companies_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_host_id_hosts_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."hosts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "hosts" ADD CONSTRAINT "hosts_email_unique" UNIQUE("email");