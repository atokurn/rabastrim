CREATE TABLE "contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_content_id" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"alt_titles" text,
	"description" text,
	"poster_url" text,
	"banner_url" text,
	"year" integer,
	"region" varchar(50),
	"tags" text,
	"rating" real,
	"is_series" boolean DEFAULT true,
	"content_type" varchar(20),
	"episode_count" integer,
	"is_vip" boolean DEFAULT false,
	"fetched_from" varchar(50) NOT NULL,
	"fetched_at" timestamp DEFAULT now(),
	"last_seen_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'active',
	"popularity_score" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episodes_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"provider_episode_id" varchar(100),
	"episode_number" integer NOT NULL,
	"title" varchar(255),
	"duration" integer,
	"is_free" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"items_processed" integer DEFAULT 0,
	"items_created" integer DEFAULT 0,
	"items_updated" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'success',
	"error" text,
	"duration_ms" integer,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "episodes_metadata" ADD CONSTRAINT "episodes_metadata_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_provider_idx" ON "contents" USING btree ("provider","provider_content_id");--> statement-breakpoint
CREATE UNIQUE INDEX "episode_content_idx" ON "episodes_metadata" USING btree ("content_id","episode_number");