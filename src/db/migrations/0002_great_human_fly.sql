CREATE TYPE "public"."service_category" AS ENUM('install_windows', 'build_pc', 'network', 'software', 'other');--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "category" "service_category" DEFAULT 'other' NOT NULL;--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category");