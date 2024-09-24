CREATE TABLE IF NOT EXISTS "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_email_unique" UNIQUE("email")
);
