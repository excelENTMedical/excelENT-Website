-- Layout templates for social graphics.
--
-- Adds the five content-shape layouts to the graphic_style enum, plus the two
-- columns they read: `graphic_items` (the step/checklist rows) and
-- `graphic_descriptor` (the small-caps line under the lockup).
--
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so this file
-- must be applied without wrapping it in BEGIN/COMMIT. psql autocommits each
-- statement by default, which is what we want here.
--
--   psql -U excelent -d excelent_cms -h localhost -f scripts/apply-social-posts-layout-columns.sql

ALTER TYPE enum_social_posts_graphic_style ADD VALUE IF NOT EXISTS 'object';
ALTER TYPE enum_social_posts_graphic_style ADD VALUE IF NOT EXISTS 'twoband';
ALTER TYPE enum_social_posts_graphic_style ADD VALUE IF NOT EXISTS 'contrast';
ALTER TYPE enum_social_posts_graphic_style ADD VALUE IF NOT EXISTS 'orbit';
ALTER TYPE enum_social_posts_graphic_style ADD VALUE IF NOT EXISTS 'statement';

ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS graphic_items text;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS graphic_descriptor varchar;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS graphic_artefact varchar;

-- The versions table must move in step. `social-posts` sets versions.maxPerDoc,
-- so every update writes a row to `_social_posts_v` through its own mirrored
-- columns and its own enum type. Leaving these behind (as the first run of this
-- file did, on 2026-09-03) breaks EVERY update to a social post — including
-- approving one in the admin — because the version write fails on the missing
-- column. Added the same day, once a repair script tripped over it.
ALTER TYPE enum__social_posts_v_version_graphic_style ADD VALUE IF NOT EXISTS 'object';
ALTER TYPE enum__social_posts_v_version_graphic_style ADD VALUE IF NOT EXISTS 'twoband';
ALTER TYPE enum__social_posts_v_version_graphic_style ADD VALUE IF NOT EXISTS 'contrast';
ALTER TYPE enum__social_posts_v_version_graphic_style ADD VALUE IF NOT EXISTS 'orbit';
ALTER TYPE enum__social_posts_v_version_graphic_style ADD VALUE IF NOT EXISTS 'statement';

ALTER TABLE _social_posts_v ADD COLUMN IF NOT EXISTS version_graphic_items text;
ALTER TABLE _social_posts_v ADD COLUMN IF NOT EXISTS version_graphic_descriptor varchar;
ALTER TABLE _social_posts_v ADD COLUMN IF NOT EXISTS version_graphic_artefact varchar;
