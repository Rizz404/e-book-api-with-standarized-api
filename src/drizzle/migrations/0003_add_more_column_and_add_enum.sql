CREATE TYPE "public"."shipping_status" AS ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "price_at_cart" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingStatus" "shipping_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_reference" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "carts_user_id_index" ON "carts" USING btree ("user_id");