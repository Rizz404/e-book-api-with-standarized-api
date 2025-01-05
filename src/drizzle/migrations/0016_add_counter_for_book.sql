ALTER TABLE "authors" ADD COLUMN "book_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "genres" ADD COLUMN "book_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "user_prefered_language_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "languages" ADD COLUMN "book_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "publishers" ADD COLUMN "book_count" integer DEFAULT 0 NOT NULL;