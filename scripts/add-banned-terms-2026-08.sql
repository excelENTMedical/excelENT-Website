-- Banned-term additions, 2026-08-18 (plan: docs/superpowers/plans/2026-08-17-social-writing-quality.md, Task 6).
--
-- WHY
--   * `actually` appeared in 14 of 51 posts in the 2026-07-31 corpus audit as pure filler,
--     and `seamless`/`seamlessly` are the same marketing tic; both go to every brand that
--     already keeps a list (1-4) and to the two new lists.
--   * Brands 5 (excelent-practice-solutions) and 8 (excelent-company, the Monday Company
--     pillar) had NO banned terms at all. This creates their first lists, modelled on the
--     brand 1-4 lists and on the standing ZAC terminology rules.
--
-- DELIBERATELY NOT BANNED
--   * `journey`  - it is a theme name ("The Modern ENT Patient Journey", "Solving Problems
--                  Across the Patient Journey") and appears in two CTAs.
--   * `solution` - "excelENT Practice Solutions" is a brand name; also in a CTA and three
--                  theme names ("One Partner. Multiple Solutions.", "Solutions tiers ...").
--   * `empower`, `innovation`, `streamline`, `ecosystem`, `platform`, `vendor` - all appear
--     in brand 5/8 theme names, theme descriptions or CTAs even though WRITING_RULES
--     discourages some of them in prose. Banning them here would fight the brand's own
--     configuration.
--
-- MATCHING NOTE
--   checkGuardrails() in src/lib/social/guardrails.ts does a normalized SUBSTRING match, so
--   `guarantee` also catches `guaranteed` and `disrupt` also catches `disruptive`. Redundant
--   pairs below (guarantee/guaranteed, seamless/seamlessly, Virtual Front Desk / AI Virtual
--   Front Desk) are kept only to mirror the existing brand 1-4 rows.
--
-- SAFETY
--   INSERT only. Nothing is updated or deleted. Idempotent: every insert carries a
--   NOT EXISTS guard on (_parent_id, lower(term)), so re-running is a no-op.
--   Every row created here gets an id prefixed `bt202608`, which is what makes the undo
--   below exact.
--
-- Backup of the pre-change rows:
--   /home/bitnami/backups/social/banned-terms-before-2026-08-18.json
--
-- ============================ UNDO (exact) ============================
--   BEGIN;
--   DELETE FROM brand_profiles_banned_terms WHERE id LIKE 'bt202608%';
--   COMMIT;
--
--   -- Undo is safe without renumbering: every row is appended after the existing
--   -- _order values, so brands 1-4 fall back to a contiguous 1..N and brands 5 and 8
--   -- return to zero rows. Verify with:
--   --   SELECT _parent_id, count(*), max(_order) FROM brand_profiles_banned_terms
--   --   GROUP BY 1 ORDER BY 1;
-- =====================================================================

\set ON_ERROR_STOP on

\echo '=== BEFORE ==='
SELECT _parent_id, count(*) AS terms, max(_order) AS max_order
FROM brand_profiles_banned_terms GROUP BY 1 ORDER BY 1;

BEGIN;

-- 1) Filler / marketing-speak for the brands that already have a list.
INSERT INTO brand_profiles_banned_terms (_order, _parent_id, id, term)
SELECT
  (SELECT COALESCE(MAX(b2._order), 0)
     FROM brand_profiles_banned_terms b2
    WHERE b2._parent_id = p.id)
  + row_number() OVER (PARTITION BY p.id ORDER BY t.ord),
  p.id,
  'bt202608' || substr(md5(random()::text || clock_timestamp()::text || p.id::text || t.term), 1, 16),
  t.term
FROM (VALUES (1, 'actually'), (2, 'seamless'), (3, 'seamlessly')) AS t(ord, term)
CROSS JOIN (VALUES (1), (2), (3), (4)) AS p(id)
WHERE NOT EXISTS (
  SELECT 1 FROM brand_profiles_banned_terms x
   WHERE x._parent_id = p.id AND lower(x.term) = lower(t.term)
);

-- 2) First list for brand 5 - excelENT Practice Solutions (sells the PS portfolio).
--    Compliance claims mirror brands 1-4; the terminology rows are the standing ZAC rules
--    ("Solutions tiers" never "Service tiers"; "Virtual Office Assistant" never "Virtual
--    Front Desk"; "minimally invasive" never "not surgery"); the outcome-guarantee rows are
--    brand 1's RCM claims, which brand 5 also speaks to.
INSERT INTO brand_profiles_banned_terms (_order, _parent_id, id, term)
SELECT
  (SELECT COALESCE(MAX(b2._order), 0)
     FROM brand_profiles_banned_terms b2
    WHERE b2._parent_id = 5)
  + row_number() OVER (ORDER BY t.ord),
  5,
  'bt202608' || substr(md5(random()::text || clock_timestamp()::text || '5' || t.term), 1, 16),
  t.term
FROM (VALUES
  (1,  'guaranteed'),
  (2,  'guarantee'),
  (3,  'risk-free'),
  (4,  'cure'),
  (5,  'eliminate denials'),
  (6,  'zero denials'),
  (7,  '100% clean claims'),
  (8,  'service tiers'),
  (9,  'Virtual Front Desk'),
  (10, 'AI Virtual Front Desk'),
  (11, 'not surgery'),
  (12, 'actually'),
  (13, 'seamless'),
  (14, 'seamlessly'),
  (15, 'one-stop shop'),
  (16, 'best-in-class')
) AS t(ord, term)
WHERE NOT EXISTS (
  SELECT 1 FROM brand_profiles_banned_terms x
   WHERE x._parent_id = 5 AND lower(x.term) = lower(t.term)
);

-- 3) First list for brand 8 - excelENT | Company (Monday Company pillar: story, mission,
--    milestones). Same compliance and terminology base, plus the founder-voice hype words a
--    company-story pillar is most likely to reach for, plus the positioning rule its own
--    "Milestones & Momentum" theme states ("never name ... a specialist directory").
INSERT INTO brand_profiles_banned_terms (_order, _parent_id, id, term)
SELECT
  (SELECT COALESCE(MAX(b2._order), 0)
     FROM brand_profiles_banned_terms b2
    WHERE b2._parent_id = 8)
  + row_number() OVER (ORDER BY t.ord),
  8,
  'bt202608' || substr(md5(random()::text || clock_timestamp()::text || '8' || t.term), 1, 16),
  t.term
FROM (VALUES
  (1,  'guaranteed'),
  (2,  'guarantee'),
  (3,  'risk-free'),
  (4,  'cure'),
  (5,  'service tiers'),
  (6,  'Virtual Front Desk'),
  (7,  'AI Virtual Front Desk'),
  (8,  'actually'),
  (9,  'seamless'),
  (10, 'seamlessly'),
  (11, 'disrupt'),
  (12, 'revolutionize'),
  (13, 'revolutionary'),
  (14, 'best-in-class'),
  (15, 'industry-leading'),
  (16, 'world-class'),
  (17, 'game-changing'),
  (18, 'specialist directory')
) AS t(ord, term)
WHERE NOT EXISTS (
  SELECT 1 FROM brand_profiles_banned_terms x
   WHERE x._parent_id = 8 AND lower(x.term) = lower(t.term)
);

COMMIT;

\echo '=== AFTER ==='
SELECT _parent_id, count(*) AS terms, max(_order) AS max_order
FROM brand_profiles_banned_terms GROUP BY 1 ORDER BY 1;

\echo '=== AFTER (terms per brand) ==='
SELECT _parent_id, string_agg(term, ', ' ORDER BY _order) AS terms
FROM brand_profiles_banned_terms GROUP BY 1 ORDER BY 1;
