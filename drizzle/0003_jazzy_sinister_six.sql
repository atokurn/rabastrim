CREATE TABLE "content_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"language_code" varchar(10) NOT NULL,
	"provider_language_id" varchar(20),
	"is_default" boolean DEFAULT false,
	"type" varchar(20) DEFAULT 'subtitle',
	"source" varchar(20) DEFAULT 'default',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"drama_id" varchar(100) NOT NULL,
	"drama_title" varchar(500),
	"drama_cover" text,
	"provider" varchar(50),
	"episode_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "release_date" date;--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "release_year" integer;--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "release_status" varchar(20) DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "release_source" varchar(20) DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clerk_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_guest" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "content_languages" ADD CONSTRAINT "content_languages_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_lang_idx" ON "content_languages" USING btree ("content_id","provider","language_code","type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_like_idx" ON "likes" USING btree ("user_id","drama_id","episode_number");--> statement-breakpoint
CREATE INDEX "likes_user_idx" ON "likes" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_clerk_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "users_guest_idx" ON "users" USING btree ("is_guest");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");