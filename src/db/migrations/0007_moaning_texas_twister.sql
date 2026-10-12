CREATE TYPE "public"."order_status" AS ENUM('pending_quote', 'quoted', 'accepted', 'paid', 'in_progress', 'completed', 'released', 'cancelled', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('sent', 'superseded', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "order_status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"actor_user_id" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending_quote' NOT NULL,
	"accepted_quote_id" uuid,
	"problem_description" text NOT NULL,
	"location_text" text,
	"completed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_accepted_has_quote" CHECK ("orders"."status" in ('pending_quote', 'quoted', 'cancelled') or "orders"."accepted_quote_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" char(3) DEFAULT 'THB' NOT NULL,
	"duration" "service_duration",
	"revisions_included" smallint,
	"note" text,
	"status" "quote_status" DEFAULT 'sent' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_amount_positive" CHECK ("quotes"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_technician_id_technician_profiles_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technician_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_accepted_quote_id_quotes_id_fk" FOREIGN KEY ("accepted_quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_status_events_order_idx" ON "order_status_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_customer_created_idx" ON "orders" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_technician_created_idx" ON "orders" USING btree ("technician_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_order_version_uidx" ON "quotes" USING btree ("order_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_one_sent_per_order_uidx" ON "quotes" USING btree ("order_id") WHERE "quotes"."status" = 'sent';