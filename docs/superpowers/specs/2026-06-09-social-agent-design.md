# ExcelENT Social Media Agent — Project Scope & Design

Date: 2026-06-09
Status: Draft for review
Owner: ai@excelentmedical.com

## 1. Goal

Build an AI system that generates brand-aligned social media content, routes
every proposed post through a human approval step, learns from that feedback,
and publishes approved posts directly to social platforms. The system should
make content creation scalable across multiple brands while keeping a human in
control of everything that goes public.

## 2. What this is and is not

This is one configurable system, not four separate bots. Each brand
(PS | RCM, PS | Lexi, PS | Connect, and the excelENT Patient-Facing audience)
is represented as a Brand Profile: a record holding that brand's voice,
audience, themes, calls-to-action, creative assets, and target platforms. A
single generation pipeline reads a profile and produces posts for it. An
orchestrator decides which brands need posts and when. Adding a fifth brand
later is a configuration change, not a new build.

The intelligence lives in the generation pipeline and the feedback loop. The
orchestrator only schedules and coordinates.

## 3. Scope decisions

These were settled during planning and drive the rest of the design.

- Build the generation plus approval loop AND direct publishing in v1.
  Performance-data optimization is deferred to a later phase.
- Target platforms for v1: LinkedIn and Facebook / Instagram (Meta).
- Connect to platforms through an aggregator API (an Ayrshare-style service)
  rather than building direct LinkedIn and Meta integrations. The aggregator
  already holds approved platform apps, which turns weeks of app-review limbo
  into days. We own the AI and approval layer; the aggregator owns the
  platform plumbing.
- Human review, editing, approval, and feedback all happen inside the existing
  Payload CMS admin. No new service to host.
- Brands are configuration-driven profiles served by one pipeline, not
  separately coded agents.
- Visuals start from a curated, approved asset library. AI image generation is
  designed for as a later enhancement but is out of scope for v1. For a
  healthcare brand, off-brand or oddly generated imagery is a compliance and
  trust risk not worth taking yet.

## 4. Architecture

Everything runs inside the existing Next.js plus Payload CMS plus PostgreSQL
application on the current server. Three new Payload collections, two scheduled
jobs, one generation service, and one external dependency (the aggregator API).

```
                +-------------------------------------------+
                |            Payload CMS (existing)         |
                |                                           |
  Orchestrator  |   Brand Profiles --+                      |
  (cron job) ---+--> Generation <----+ (reads config +      |
                |    Service         |  feedback corpus)    |
                |       |            |                      |
                |       v            |                      |
  Reviewers ----+--> Social Posts <--+    Asset Library     |
  (admin UI)    |    (draft->approved)    (media, tagged)   |
                |       |                                    |
  Publisher ----+-------+                                    |
  (cron job)    |       +--> Aggregator API --> LinkedIn/Meta|
                +-------------------------------------------+
```

The Claude API is the generation engine. The aggregator is the only component
that talks to LinkedIn and Meta.

## 5. Data model — three collections

### Brand Profile

One record per brand. Holds:

- Voice and tone guidance
- Target audience description
- Content themes and messaging pillars
- Default calls-to-action
- Active platforms (LinkedIn, Meta, etc.)
- Posting frequency and cadence
- Guardrails: banned terms and required disclaimers. This is important for a
  healthcare brand and reuses existing terminology rules.
- A handful of seed example posts to anchor the brand's style

### Asset

Uploaded images, brand templates, and logos, tagged by brand and theme. The
generation pipeline selects the best-fitting existing asset. The field is
designed so an AI-generation source can be added later without schema changes.

### Social Post

The core working record:

- Brand and target platform(s)
- Copy
- Selected asset
- Call-to-action
- Status: draft -> needs changes / approved -> scheduled ->
  published / failed / rejected
- Scheduled time
- Reviewer feedback
- Edit history
- After publishing: the live post URL and the aggregator's post ID

## 6. Generation pipeline

Given a Brand Profile and a calendar slot, the service builds a prompt from the
brand configuration, the selected theme, and a few-shot set drawn from the
brand's own recently approved and edited posts plus recent rejection reasons.
It calls the Claude API, selects a fitting asset from the library, and saves the
result as a draft.

That few-shot mechanism is the v1 learning loop. The system writes more like the
posts that get approved and avoids what has been rejected, with no performance
analytics required yet.

## 7. Approval and feedback loop

Reviewers work entirely in the Payload admin: they see drafts with image
previews, edit copy inline, set status, and leave feedback. Every approve,
edit, and reject enriches the corpus that feeds the generation pipeline.
Approved posts are given a scheduled time (manual in v1; suggested times are a
later enhancement).

Nothing reaches a platform without passing through this approval step.

## 8. Orchestrator and publisher

### Orchestrator (scheduled job)

For each brand's frequency, it checks how many approved posts are queued for the
upcoming window and generates drafts to fill the gap. It never publishes — it
only produces drafts for humans to review.

### Publisher (scheduled job)

It finds posts that are both approved and scheduled and whose time has arrived,
sends them to the aggregator, and records the live URL — or marks the post as
failed with the error. Human approval is always upstream of this step.

## 9. Build phasing

### Phase A — Generation and approval

Collections, brand profiles, asset library, a manual "Generate now" action, and
the approval and feedback loop. This validates content quality with zero
publishing risk.

### Phase B — Scheduling and publishing

The orchestrator's scheduled generation plus aggregator-based publishing.

### Phase C — Performance optimization (deferred)

Pull engagement, impressions, clicks, and other metrics from the aggregator's
analytics endpoint to rank what works and feed it back into generation. This is
the "optimize over time" goal, built once content quality is proven. A clean
seam is left for it in the data model and pipeline.

## 10. External dependencies and costs

- Aggregator API subscription (Ayrshare or comparable): roughly $50 to $150 per
  month depending on plan and connected accounts. Exact service to be confirmed
  during implementation.
- Claude API usage for generation: pay-as-you-go, low for the expected volume.

## 11. Open items to confirm during implementation

- Final choice of aggregator service and plan tier.
- Posting frequency and cadence per brand.
- Initial set of approved assets to seed the library.
- Reviewer roles and who has approval authority in the Payload admin.
