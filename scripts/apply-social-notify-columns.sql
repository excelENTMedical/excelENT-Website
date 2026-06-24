BEGIN;

-- brand_profiles_reviewers array table (new)
CREATE TABLE "brand_profiles_reviewers" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL
);
ALTER TABLE "brand_profiles_reviewers" ADD CONSTRAINT "brand_profiles_reviewers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "brand_profiles_reviewers_order_idx" ON "brand_profiles_reviewers" USING btree ("_order");
CREATE INDEX "brand_profiles_reviewers_parent_id_idx" ON "brand_profiles_reviewers" USING btree ("_parent_id");

-- social_posts notify_* timestamp columns (new)
ALTER TABLE "social_posts" ADD COLUMN "notify_generated_at" timestamp(3) with time zone;
ALTER TABLE "social_posts" ADD COLUMN "notify_review_sent_at" timestamp(3) with time zone;
ALTER TABLE "social_posts" ADD COLUMN "notify_reminder_sent_at" timestamp(3) with time zone;
ALTER TABLE "social_posts" ADD COLUMN "notify_published_notified_at" timestamp(3) with time zone;

-- _social_posts_v version_notify_* timestamp columns (new)
ALTER TABLE "_social_posts_v" ADD COLUMN "version_notify_generated_at" timestamp(3) with time zone;
ALTER TABLE "_social_posts_v" ADD COLUMN "version_notify_review_sent_at" timestamp(3) with time zone;
ALTER TABLE "_social_posts_v" ADD COLUMN "version_notify_reminder_sent_at" timestamp(3) with time zone;
ALTER TABLE "_social_posts_v" ADD COLUMN "version_notify_published_notified_at" timestamp(3) with time zone;

COMMIT;
