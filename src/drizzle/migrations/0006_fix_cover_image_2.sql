DROP INDEX IF EXISTS "unique_index_book_cover";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_index_book_cover" ON "book_pictures" USING btree ("book_id","is_cover") WHERE "book_pictures"."is_cover" = true;