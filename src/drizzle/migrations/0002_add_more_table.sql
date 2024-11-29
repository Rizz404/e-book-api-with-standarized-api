CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "author_follows" (
	"followed_user_id" uuid NOT NULL,
	"following_author_id" uuid NOT NULL,
	CONSTRAINT "author_follows_followed_user_id_following_author_id_pk" PRIMARY KEY("followed_user_id","following_author_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "genre_follows" (
	"followed_user_id" uuid NOT NULL,
	"following_genre_id" uuid NOT NULL,
	CONSTRAINT "genre_follows_followed_user_id_following_genre_id_pk" PRIMARY KEY("followed_user_id","following_genre_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"shipping_service_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"price_sold" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publisher_follows" (
	"followed_user_id" uuid NOT NULL,
	"following_publisher_id" uuid NOT NULL,
	CONSTRAINT "publisher_follows_followed_user_id_following_publisher_id_pk" PRIMARY KEY("followed_user_id","following_publisher_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipping_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"estimation_time" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"admin_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_shipping_services_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payment_method_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"subtotal_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"detail_address" text NOT NULL,
	"coordinate" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_follows" (
	"followed_user_id" uuid NOT NULL,
	"following_user_id" uuid NOT NULL,
	CONSTRAINT "user_follows_followed_user_id_following_user_id_pk" PRIMARY KEY("followed_user_id","following_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_prefered_languages" (
	"followed_user_id" uuid NOT NULL,
	"following_language_id" uuid NOT NULL,
	CONSTRAINT "user_prefered_languages_followed_user_id_following_language_id_pk" PRIMARY KEY("followed_user_id","following_language_id")
);
--> statement-breakpoint
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "age" smallint;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "author_follows" ADD CONSTRAINT "author_follows_followed_user_id_users_id_fk" FOREIGN KEY ("followed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "author_follows" ADD CONSTRAINT "author_follows_following_author_id_authors_id_fk" FOREIGN KEY ("following_author_id") REFERENCES "public"."authors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "genre_follows" ADD CONSTRAINT "genre_follows_followed_user_id_users_id_fk" FOREIGN KEY ("followed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "genre_follows" ADD CONSTRAINT "genre_follows_following_genre_id_genres_id_fk" FOREIGN KEY ("following_genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_service_id_shipping_services_id_fk" FOREIGN KEY ("shipping_service_id") REFERENCES "public"."shipping_services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publisher_follows" ADD CONSTRAINT "publisher_follows_followed_user_id_users_id_fk" FOREIGN KEY ("followed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publisher_follows" ADD CONSTRAINT "publisher_follows_following_publisher_id_publishers_id_fk" FOREIGN KEY ("following_publisher_id") REFERENCES "public"."publishers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followed_user_id_users_id_fk" FOREIGN KEY ("followed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_user_id_users_id_fk" FOREIGN KEY ("following_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_prefered_languages" ADD CONSTRAINT "user_prefered_languages_followed_user_id_users_id_fk" FOREIGN KEY ("followed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_prefered_languages" ADD CONSTRAINT "user_prefered_languages_following_language_id_languages_id_fk" FOREIGN KEY ("following_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "books_isbn_index" ON "books" USING btree ("isbn");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_user_id_index" ON "user_profiles" USING btree ("user_id");