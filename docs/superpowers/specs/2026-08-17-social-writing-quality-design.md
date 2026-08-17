# Social writing quality: slop detection, corpus quality gate, and bullets

**Date:** 2026-08-17
**Status:** Approved, ready for implementation planning
**Supersedes nothing.** Extends the anti-slop work started in `PROMPT_VERSION = 'v2-no-slop'`.

## Problem

The v2 anti-slop rules were written in July and measured on 2026-07-31 against a
51-text corpus. The rules themselves were sound; the *examples* contradicted them.
All eight brand seed examples contained em dashes, and the user prompt handed them
over labelled "match this quality and tone." Demonstration beat instruction.

Those seeds were rewritten. It worked, and then it decayed:

| Week | Posts | With em dash |
|---|---|---|
| 2026-06-29 | 17 | 82% |
| 2026-07-06 | 3 | 100% |
| 2026-07-13 | 13 | 100% |
| 2026-07-27 | 11 | 27% |
| 2026-08-03 | 9 | 33% |
| 2026-08-10 | 5 | 60% |
| 2026-08-17 | 1 | 100% |

All nine current seed examples are clean. So the seeds are no longer the source.
The source is now the few-shot learning loop.

`buildCorpus` selects the six most recent approved posts **by recency alone**, with no
quality filter, and `buildUserPrompt` labels them "POSTS THAT WERE APPROVED — match this
quality and tone." Of the eight most recently approved posts, three open with `Most [noun]`:

```
64  Aug 17  "Most healthcare technology was built for hospitals and large..."
63  Aug 14  "Most sinus patients choose a practice before they ever make..."
61  Aug 04  "Most practices accept denied claims as a billing reality..."
60  Aug 07  "...a starting point, not the..."     <- mid-sentence X-not-Y
```

No rule anywhere says "open with Most." The loop learned the formula from its own
output and is teaching it back. **Anything that survives human review becomes the new
template, tics included.** This is the seed-example failure one layer up, and it will
recur after any one-off cleanup because nothing measures the output.

Three of the four items from the 2026-07-31 audit remain unbuilt: `detectSlop()` does
not exist, `WRITING_RULES` still bans only the two-sentence binary contrast and not the
mid-sentence `X, not Y` form (27% of posts), and the banned-term additions were never
made. Brands 5 (`excelent-practice-solutions`) and 8 (`excelent-company`) have **zero**
banned-term rows; brand 8 is the Monday Company pillar.

Separately: no post has ever contained a bullet. All 59 are prose.

## Goals

1. Measure slop on every generated draft instead of hoping the prompt holds.
2. Repair a flagged draft once, automatically, before it reaches the review queue.
3. Stop the learning loop from amplifying its own tics.
4. Let the model use bullets when the content is genuinely enumerable.
5. Rewrite the nine posts scheduled 2026-08-19 through 08-31 under the new rules.

## Non-goals

- **Cross-post repetition.** Posts 73 and 78 both open "Generic healthcare software…",
  and the 07-31 audit found four posts sharing "partner practices, that has meant". A
  per-post detector structurally cannot catch this — it requires comparison against the
  corpus. The quality gate below reduces it indirectly by not feeding duplicate openers
  back in, but a real fix is separate work.
- **Slot time normalization** (Mon–Wed 9am, Thu 11am, Fri 2pm ET). Unrelated.
- **The Revise route.** `/api/social/revise` (the manual "rewrite this" button) gets no
  slop check in this work. It is human-triggered on a post a reviewer is already reading,
  so the review gate is already engaged. Wiring the detector in later is a small change
  once `slop.ts` exists.
- **Blocking saves.** Guardrails in this system are advisory by design; the human review
  gate is the control. Nothing here changes that.

## Design

### 1. `src/lib/social/slop.ts` — a pure detector module

No I/O, no Payload, no network. Mirrors the shape of the existing `guardrails.ts`.

```ts
export interface SlopFlag { rule: SlopRule; excerpt: string }
export interface SlopResult { ok: boolean; flags: SlopFlag[] }
export function detectSlop(copy: string, opts?: DetectSlopOpts): SlopResult
```

Each detector returns the offending excerpt, not just a boolean. The excerpt is what
makes the repair pass in §2 work — "you used an em dash" is a weaker instruction than
quoting the sentence back.

Rules, each drawn from a pattern the 07-31 audit actually measured:

| Rule | Catches | Audit rate |
|---|---|---|
| `emDash` | any `—` | 88% |
| `multiEmDash` | 2+ in one post | 56% |
| `colonReveal` | dramatic colon *not* introducing a list | 29% |
| `notYButX` | mid-sentence `X, not Y` | 27% (v2 missed) |
| `dramaticFragment` | sentence of ≤4 words | 23% |
| `binaryContrast` | `That's not X. That's Y.` across sentences | 9% |
| `formulaOpener` | `Most [noun]`, `Here's the thing`, etc. | 8 posts |
| `weaselAttribution` | `studies show`, `experts agree` | — |

**Two exclusions are mandatory**, and both were learned the hard way:

- **Required disclaimers are stripped before detection.** The patient-facing disclaimer
  is mandated verbatim and carries its own em dash. Counting it flags the writer for
  compliance, which is how the original audit produced a misleading number until it was
  excluded.
- **The trailing hashtag block is stripped.** `#ENT #Otolaryngology` is not prose and
  trips the fragment detector.

**Bullet-aware exclusions** (see §4): a line beginning with `•` is never a
`dramaticFragment`, and a colon whose next non-empty line begins with `•` is never a
`colonReveal`. Both are legitimate list punctuation, which `WRITING_RULES` already
allows ("Colons are for lists and labels, not drama").

### 2. Repair pass in `generate.ts`

After `parseDrafts`, per draft:

```
detectSlop(copy) → ok?      → save
                 → flagged? → one repair call → re-detect → save with residual flags
```

The repair prompt hands the model its own violations with excerpts and instructs it to
fix only those, preserving meaning, facts, figures, CTA, and any required disclaimer
verbatim. It reuses `callClaude` and the existing brand system prompt.

**One attempt. Never blocks the save. Never loops.** A draft that is still flagged after
repair saves anyway, with its residual flags visible in the review queue. An empty
calendar slot is worse than an imperfect draft, and a retry loop on a stubborn theme
burns credits with no ceiling.

Cost: one extra API call per flagged draft. At the current ~30% flag rate and roughly
five posts a week, that is a rounding error.

**Flags fold into the existing `generationMeta.guardrailFlags` string** rather than a new
field. This is deliberate: a new field means DDL plus a hand-patched `payload-types.ts`,
because the Payload 3 codegen CLI is broken in this environment — both `generate:types`
paths fail (payload 3.75.0, confirmed 2026-06-23). The whole change ships with **zero
schema migration**.

Format: `banned: …; missing disclaimers: …; slop: emDash, notYButX`

**`generationMeta.originalCopy` must hold the post-repair copy** — the copy actually
saved. Its documented meaning is "copy exactly as the model generated it, before any
human edit", and `buildCorpus` uses `originalCopy !== copy` to detect human edits and
build the before/after `edited` corpus. Storing the pre-repair draft there would make
the loop read our own machine repair as a human correction and learn from it. The
pre-repair draft is not persisted.

### 3. Corpus quality gate — `corpus.ts`

The fix for the amplification, and the highest-leverage change here.

`buildCorpus` currently sorts by `updatedAt` and takes the top six approved. It gains a
quality pass:

- Score each approved candidate with `detectSlop`.
- Prefer clean posts over flagged ones; within each group, keep recency ordering.
- **De-duplicate openers** by normalized first four words, so three `Most …` posts
  cannot occupy three of six exemplar slots.
- If fewer than `maxApproved` clean posts exist, fall back to the least-flagged
  remainder. The corpus never returns empty — a cold brand with no clean history still
  generates.

The `edited` pairs get the same de-duplication. A human edit that removed slop is the
single most valuable signal in the system and currently competes for four slots on
recency alone.

`buildCorpus` stays pure and synchronous; `detectSlop` is pure, so this adds no I/O.

### 4. Bullets

`format: "prose" | "bullets"` joins the JSON contract the model returns, alongside the
existing `graphicStyle`. The model chooses per post.

`parseDrafts` validates it the same way it validates `graphicStyle` — unknown or missing
values default to `"prose"`, so an older model response stays valid.

Prompt guidance covers when bullets earn their place (enumerable causes, steps, features,
comparisons) and when they do not (company story, patient narrative, anything with a
through-line), plus the mechanics: literal `•`, three to five items, parallel grammar, no
terminal periods on fragments.

**`format` is a generation-time choice and is not persisted.** The copy itself carries
the bullet characters. This keeps the zero-DDL property from §2.

**The publish path needs no changes.** `escapeLittleText` escapes LinkedIn's reserved
little-text characters `|{}@[]()<>*_~`; `•` and newlines are not among them, so bulleted
copy publishes intact. Verified against `src/lib/social/publish/linkedin/client.ts`.

### 5. Prompt patches — `PROMPT_VERSION` → `v3`

- `WRITING_RULES` gains the mid-sentence `X, not Y` form. The existing rule names only
  the two-sentence version and the audit shows the model routing around it.
- Bullet guidance per §4.
- Bump the version so drafts remain attributable to the rules they were written under.
  This is what made the 07-31 audit possible.

Banned-term data changes (SQL, no code):

- Add `actually`, `seamless`, `seamlessly` to brands 1–4. `actually` appeared in 14 posts
  as pure filler.
- Create first-ever lists for brands 5 and 8.
- **Do not add** `journey` (a theme name) or `solution` ("Practice Solutions" is a brand).

### 6. Backfill — `scripts/reslop-check.mts`

Runs the nine drafts scheduled 2026-08-19 → 08-31 through detect → repair → save. Seven
of the nine currently carry em dashes.

- `--dry-run` prints per-post flags and the proposed rewrite, writing nothing. Default.
- Payload versioning retains originals in `_social_posts_v`.
- Scoped by `scheduledTime >= 2026-08-19 AND status = 'draft'`. **Scope by what makes a
  post eligible, not by a date range that happens to contain it** — on 2026-07-31 a
  date-scoped delete nearly swept up eight freshly generated posts that landed between
  planning and execution. Approved and sent posts are never touched.
- Uses the Payload local API with `skipNotify` context so the rewrite does not re-fire
  lifecycle emails.
- **Stop `social-scheduler` before running.** The hourly planner refills any empty slot
  in its 14-day horizon and has sniped a vacated slot before (post 38, 2026-07-09).

### 7. Tests

`node:test`, matching the existing suites:

- `slop.test.ts` — one case per rule, plus a clean post that trips nothing.
- Disclaimer exclusion: the patient-facing disclaimer alone produces zero flags.
- Hashtag-block exclusion.
- Bullet exclusions: a `•` line is not a fragment; a colon introducing a list is not a
  colon reveal.
- `corpus.test.ts` — clean posts outrank flagged ones; duplicate openers collapse; a
  corpus of entirely flagged posts still returns exemplars rather than empty.
- `generate.test.ts` — a flagged draft triggers exactly one repair call; a clean draft
  triggers none; a still-flagged draft saves with residual flags.

## Risks

**The repair pass flattens voice.** Mechanical de-slopping can produce correct, lifeless
copy. Mitigated by repairing only flagged spans rather than rewriting wholesale, and by
the human review gate. Watch the first week of output.

**The detector fires on legitimate prose.** `dramaticFragment` at ≤4 words will catch some
intentional short sentences. Flags are advisory and visible, never blocking, so a false
positive costs a glance rather than a lost post.

**Corpus starvation.** If the quality gate is too strict, a brand with a flagged history
feeds a thin corpus. Handled by the least-flagged fallback in §3.

## Verification

- All node:test suites green.
- `scripts/reslop-check.mts --dry-run` reviewed by hand before a live run.
- After the backfill, re-run `analyze-corpus.py` (in `/home/bitnami/tools/social/`) and
  compare against the 07-31 baseline. That script is the only reason this problem was
  ever visible; it stays the measurement of record.
- Em dash rate on drafts generated post-deploy, checked after one week.
