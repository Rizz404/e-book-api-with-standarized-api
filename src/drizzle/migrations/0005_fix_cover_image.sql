DROP INDEX IF EXISTS "book_pictures_book_id_is_cover_index";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_index_book_cover" ON "book_pictures" USING btree ("book_id","is_cover");