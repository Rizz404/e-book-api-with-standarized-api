ALTER TABLE "book_genre" DROP CONSTRAINT "book_genre_book_id_books_id_fk";
--> statement-breakpoint
ALTER TABLE "book_genre" DROP CONSTRAINT "book_genre_genre_id_genres_id_fk";
--> statement-breakpoint
ALTER TABLE "book_pictures" DROP CONSTRAINT "book_pictures_book_id_books_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_pictures" ADD CONSTRAINT "book_pictures_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
