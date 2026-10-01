CREATE TYPE "public"."service_duration" AS ENUM('same_day', 'days_1_2', 'days_3_5', 'week_plus');--> statement-breakpoint
CREATE TABLE "service_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"position" smallint NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_images_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "duration" "service_duration" DEFAULT 'days_1_2' NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "service_area" text;--> statement-breakpoint
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "service_images_service_position_uq" ON "service_images" USING btree ("service_id","position");