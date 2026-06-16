# Revise-with-Feedback — Design

Status: **approved, ready for implementation plan.**
Date: 2026-06-16
Builds on: the Phase A generator (`src/lib/social/`) and the preview + graphics
work (`graphicStyle` / `graphic` fields on `social-posts`).

## Problem

Today's feedback loop is **batch-level**: editing a draft and setting its status,
or writing reviewer feedback, only shapes the *next* generation run (via the
few-shot corpus in `corpus.ts`). There is no way to say "make *this* post punchier"
or "use the stat card instead" and have the AI rewrite the post in place. The
graphic has no AI feedback path at all. This adds a per-post **Revise** action.

## Decisions (settled in brainstorming)

- **Target is chosen per revision** via a Copy / Graphic / Both toggle next to the
  feedback box.
- **Revisions overwrite the post in place.** `social-posts` already keeps version
  history (`versions.maxPerDoc: 20`), so changes are rollback-able.
- **No schema change.** Revise only writes fields that already exist (`copy`,
  `cta`, `graphicStyle`, `graphic`, `generationMeta.guardrailFlags`, `status`).
- **The revision note is not persisted** for v1 — version history records what
  changed. An audit field can be added later if wanted.
- Reuse the existing `callClaude`, guardrail check, and brand-config shaping; add
  no dependencies.

## Architecture

### 1. Brand-config helper — refactor in `src/lib/social/generate.ts`

The block in `generateDrafts` that maps a brand doc to `BrandConfigForPrompt`
(name, voice, audience, themes, defaultCtas, bannedTerms, requiredDisclaimers,
seedExamples) is extracted into an exported `buildBrandConfig(brand: Record<string, any>): BrandConfigForPrompt`.
`generateDrafts` calls it; `reviseDraft` calls it too. No behavior change — this
is targeted DRY so both flows share one source of truth.

### 2. Revise prompt + parser — `src/lib/social/revise.ts`

- `ReviseTarget = 'copy' | 'graphic' | 'both'`.
- `buildRevisePrompt(brand: BrandConfigForPrompt, post, note, target)` returns
  `{ system, user }`:
  - **system:** the same brand system prompt used for generation
    (`buildSystemPrompt(brand)`) — voice, banned terms, disclaimers, the
    healthcare guardrail line.
  - **user:** shows the post's current `copy`, `cta`, `graphicStyle`, and `graphic`
    fields; states the reviewer's note; instructs a rewrite of the targeted
    field(s) only, keeping the rest; forbids inventing figures; and specifies the
    JSON response shape (only the keys relevant to `target`):
    - `copy` → `{ "copy": "...", "cta": "..." }`
    - `graphic` → `{ "graphicStyle": "...", "graphic": { ... } }`
    - `both` → all of the above.
- `parseRevision(text, target)` tolerates fenced/prose-wrapped JSON (same
  bracket-tolerant approach as `parseDrafts`, but parses a single object) and
  returns a normalized `{ copy?, cta?, graphicStyle?, graphic? }` containing only
  the fields valid for `target`, with the same `graphicStyle` coercion (unknown →
  `hook`) and empty-graphic-key filtering used by the generator.

### 3. Orchestrator — `reviseDraft` in `src/lib/social/revise.ts`

`reviseDraft(postId, opts: { note: string; target: ReviseTarget }): Promise<void>`:
1. `getPayloadClient()`; load the post (`depth: 1` so brand is populated).
2. `buildBrandConfig(post.brand)` → `buildRevisePrompt(...)` → `callClaude(system, user)`.
3. `parseRevision(text, target)`.
4. If the result includes copy, re-run `checkGuardrails(copy, bannedTerms, requiredDisclaimers)`.
5. `payload.update` the post with ONLY the targeted fields:
   - copy target → `copy`, `cta`, and refreshed `generationMeta.guardrailFlags`.
   - graphic target → `graphicStyle`, `graphic`.
   - both → all of the above.
   - always set `status: 'draft'` (a fresh AI output needs re-review).
   - `generationMeta.originalCopy` is left untouched (preserves the first-gen
     anchor for the edit corpus).
6. Returns void; the route re-reads or the client refreshes.

Like `generateDrafts`, the orchestrator calls `getPayloadClient()` and
`callClaude` directly; the pure pieces (`buildRevisePrompt`, `parseRevision`,
`buildBrandConfig`) carry the unit tests, and the orchestrator itself is verified
manually.

### 4. Route — `src/app/api/social/revise/route.ts`

`POST { postId, note, target }` — `runtime='nodejs'`, `dynamic='force-dynamic'`.
Auth-gated via `payload.auth({ headers })` (401 if no user). Validates body
(400 on missing `postId`/`note`; `target` defaults to `both` if absent/invalid).
Calls `reviseDraft`; wraps in try/catch with `payload.logger.error` → 500;
returns `{ ok: true }` on success. Mirrors the existing
`src/app/api/social/generate/route.ts`.

### 5. Admin control — `src/components/admin/ReviseDraftButton.tsx`

A `ui` field on `social-posts` (registered in `importMap.js`, mirroring
`GenerateDraftsButton`/`PostPreview`). `'use client'`; uses `useDocumentInfo`
for the id. Renders a feedback `<textarea>`, a Copy/Graphic/Both `<select>`, and a
**Revise** button. On click it `POST`s `{ postId, note, target }` to
`/api/social/revise` with `credentials: 'include'`. On success it refreshes the
document (e.g. `router.refresh()` / reload) so the editor fields and the live
preview reflect the new values. Shows a busy state and success/error message.
Disabled until the note is non-empty and the doc is saved (has an id).

### 6. Testing — `node:test` via `tsx`

- `revise.test.ts`:
  - `buildRevisePrompt`: for each target, the user prompt contains the note, the
    current copy/graphic values, and the correct rewrite instruction; the system
    prompt carries the brand voice + banned terms.
  - `parseRevision`: extracts a single JSON object from fenced/prose text; returns
    only the fields valid for the target; coerces an unknown `graphicStyle` to
    `hook`; drops empty graphic keys.
- `generate.test.ts`: a test that `buildBrandConfig` maps a brand doc to the
  expected `BrandConfigForPrompt` shape (guards the refactor).

## Scope guards (YAGNI)

- No new DB columns; no new npm dependencies.
- Revision note not persisted (version history suffices for v1).
- No side-by-side/new-draft mode (overwrite-in-place was chosen).
- Admin refresh is a document reload for v1; in-form patching without reload is a
  possible later enhancement.

## Out of scope / deferred

- Persisting a revision/audit log of notes.
- Feeding the revision note into the batch corpus (the first-gen→final before/after
  pair already trains the next batch on approve).
- Review-workspace UI, LinkedIn/Blotato publishing (separate efforts).
