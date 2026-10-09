ALTER TABLE "products" ADD COLUMN "is_flash_sale" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sale_end_time" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_best_selling" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_featured" boolean DEFAULT false;