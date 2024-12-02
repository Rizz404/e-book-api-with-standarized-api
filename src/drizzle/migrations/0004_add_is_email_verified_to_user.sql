ALTER TABLE "users" RENAME COLUMN "isVerified" TO "is_verified";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_email_verified" boolean DEFAULT false NOT NULL;