CREATE TABLE IF NOT EXISTS "book_wishlist" (
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	CONSTRAINT "book_wishlist_user_id_book_id_pk" PRIMARY KEY("user_id","book_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_wishlist" ADD CONSTRAINT "book_wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_wishlist" ADD CONSTRAINT "book_wishlist_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
