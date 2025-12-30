CREATE TABLE "drama_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(100) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"poster_url" text,
	"banner_url" text,
	"year" integer,
	"rating" real,
	"is_vip" boolean DEFAULT false,
	"total_episode" integer,
	"is_completed" boolean DEFAULT false,
	"last_fetched" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episode_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(100) NOT NULL,
	"drama_external_id" varchar(100) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"title" varchar(500),
	"episode_number" integer,
	"sort_order" integer,
	"duration" integer,
	"is_free" boolean DEFAULT true,
	"last_fetched" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "watch_history" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "watch_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "watch_history" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "favorites" ADD COLUMN "provider" varchar(50);--> statement-breakpoint
ALTER TABLE "favorites" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "watch_history" ADD COLUMN "provider" varchar(50);--> statement-breakpoint
ALTER TABLE "watch_history" ADD COLUMN "is_completed" boolean DEFAULT false;--> statement-breakpoint
CREATE UNIQUE INDEX "drama_provider_idx" ON "drama_cache" USING btree ("external_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "episode_provider_idx" ON "episode_cache" USING btree ("external_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "user_favorite_idx" ON "favorites" USING btree ("user_id","drama_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_drama_idx" ON "watch_history" USING btree ("user_id","drama_id");