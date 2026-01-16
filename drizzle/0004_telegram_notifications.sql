-- Migration: Create telegram_notifications table
-- Tracks which dramas have been notified to Telegram channel

CREATE TABLE "telegram_notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "content_id" uuid NOT NULL,
    "provider" varchar(50) NOT NULL,
    "provider_content_id" varchar(100) NOT NULL,
    "message_id" integer,  -- Telegram message ID returned from API
    "sent_at" timestamp DEFAULT now(),
    "status" varchar(20) DEFAULT 'sent',  -- sent, failed, pending
    "error" text,
    "created_at" timestamp DEFAULT now()
);

--> statement-breakpoint
ALTER TABLE "telegram_notifications" ADD CONSTRAINT "telegram_notifications_content_id_contents_id_fk" 
    FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE UNIQUE INDEX "notif_content_idx" ON "telegram_notifications" ("content_id");

--> statement-breakpoint
CREATE INDEX "notif_provider_idx" ON "telegram_notifications" ("provider");

--> statement-breakpoint
CREATE INDEX "notif_status_idx" ON "telegram_notifications" ("status");
