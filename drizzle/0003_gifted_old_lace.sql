CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"flash_sale_end_time" timestamp
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "badge" text;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "sale_end_time";