CREATE TYPE "public"."service_mode" AS ENUM('remote', 'onsite');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('draft', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TABLE "technician_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"skills" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technician_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"mode" "service_mode" DEFAULT 'remote' NOT NULL,
	"base_price_amount" integer NOT NULL,
	"currency" char(3) DEFAULT 'THB' NOT NULL,
	"status" "service_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD CONSTRAINT "technician_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_technician_id_technician_profiles_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technician_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "services_technician_idx" ON "services" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "services_status_created_idx" ON "services" USING btree ("status","created_at");