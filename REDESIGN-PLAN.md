# Redesign ExcelENT Payload Site to Match WordPress Site

**Date:** 2026-02-10
**Status:** Planned
**WordPress reference:** https://www.excelentmedical.com/

## Context
The Payload CMS site is functionally complete (all 10 implementation steps done, CMS data flowing) but uses a blue/green tech-forward design instead of matching the live WordPress site's purple/blue medical-professional branding. The goal is to make the Payload site visually identical to the WordPress site while keeping all CMS integration intact.

## Approach
The Tailwind config uses semantic color tokens (`primary`, `secondary`, `accent`) consistently across all 17 components and 6 pages. Swapping the color hex values in `tailwind.config.js` will cascade ~80% of the visual changes automatically. The remaining work is structural: footer redesign, button style changes, content updates, and adding missing sections.

## Color Mapping
| Token | Before (current) | After (WordPress match) |
|-------|------------------|------------------------|
| primary | Blue #247deb | Purple #89007a |
| secondary | Green #16a34a | Blue #459fdc |
| accent | Purple #c026d3 | Pink-purple #C25BAB |
| navy | N/A | #061b42 |
| footer bg | gray-900 | #c8dfff |

## Font Mapping
| Usage | Before | After |
|-------|--------|-------|
| Body | Inter | Cabin |
| Headings | Montserrat | Montserrat (unchanged) |

---

## Phase 1: Color Palette, Fonts, and Button Styles (3 files)

### 1.1 Update Tailwind color palette
**File:** `tailwind.config.js`
- **primary**: Blue (#247deb) → Purple (#89007a) with full 50-950 scale
- **secondary**: Green (#16a34a) → Blue (#459fdc) with full 50-950 scale
- **accent**: Purple (#c026d3) → Pink-purple (#C25BAB) with full scale
- Add `navy: '#061b42'` and `footer: '#c8dfff'` utility colors

### 1.2 Swap body font from Inter to Cabin
**File:** `src/app/(frontend)/[locale]/layout.tsx`
- Replace `Inter` import with `Cabin` from `next/font/google`
- Update CSS variable from `--font-inter` to `--font-cabin`

**File:** `tailwind.config.js`
- Update `fontFamily.sans` to use `var(--font-cabin)`

### 1.3 Update global button styles to pill buttons
**File:** `src/app/globals.css`
- `.btn-primary`: Change to `rounded-full bg-white text-accent-500 border-2 border-accent-500 hover:bg-accent-500 hover:text-white`
- `.btn-secondary`: Change to `rounded-full bg-accent-500 text-white border-2 border-accent-500 hover:bg-white hover:text-accent-500`
- `.btn-accent`: Update to `rounded-full` with new accent colors

---

## Phase 2: Component Updates (8 files)

### 2.1 Footer — light blue background, restructured columns
**File:** `src/components/Footer.tsx`
- Background: `bg-gray-900` → `bg-[#c8dfff]`
- Text: white → dark (`text-gray-900`, `text-gray-700`)
- Restructure 4 columns: Quick Links, FAQs, Resources, Additional Links
- Social icons: `bg-gray-800` → `bg-primary-600` (purple)
- Bottom bar border: `border-gray-800` → `border-blue-200`

### 2.2 StatsSection — match WordPress stats
**File:** `src/components/StatsSection.tsx`
- Change stats to: 1M+ Patients Treated, 97% Success Rate, 95% Symptom Improvement, 97% Insurance Approval
- Update props interface
- Swap icons to match new stats

### 2.3 ThreeStepProcess → 4 steps
**File:** `src/components/ThreeStepProcess.tsx`
- Add 4th step: "You LIVE Better"
- Update defaults: We Connect → They Treat → You Breathe Better → You LIVE Better
- Grid: `md:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-4`

### 2.4 FAQ — update default questions
**File:** `src/components/FAQ.tsx`
- Replace defaults: What is Sinusitis?, What are the Symptoms?, Can it be Treated?, How to Find a Specialist?

### 2.5 Header — remove Find Specialist from nav items
**File:** `src/components/Header.tsx`
- Remove "Find Specialist" from `navItems` (it's already the CTA button)
- Colors auto-update from Phase 1

### 2.6 SpecialistCard — add practice logo + mission statement
**File:** `src/components/SpecialistCard.tsx`
- Add `practiceLogo?: string` and `missionStatement?: string` props
- Add layout areas for logo and mission text

### 2.7 HubSpotForm — fix hardcoded hex colors
**File:** `src/components/HubSpotForm.tsx`
- `#247deb` → `#89007a` (focus ring)
- `#3b9cf6` → `#89007a` (border)
- `#1c66d8` → `#6d0062` (button hover)

### 2.8 Hero — minor adjustments
**File:** `src/components/Hero.tsx`
- Gradient auto-updates to purple from Phase 1
- Verify wave SVG fill color matches section below

---

## Phase 3: New Component + Homepage Restructure (2 files)

### 3.1 Create SymptomsSection component
**New file:** `src/components/SymptomsSection.tsx`
- Grid of symptom cards: Facial pain, Congestion, Runny nose, Loss of smell, Cough, Fever, Bad breath, Fatigue, Dental pain
- Each card: icon + title

### 3.2 Homepage — add sections and reorder
**File:** `src/app/(frontend)/[locale]/page.tsx`
- New section order: Hero → Stats → SymptomsSection → ThreeStepProcess (4-step) → Specialists → FAQ → CTA

---

## Phase 4: i18n and Content Updates (2 files)

### 4.1 English messages
**File:** `messages/en.json`
- Hero: "Breathe Better, Live Better" / "Experience freedom from sinus pain..."
- Stats: Update labels (Patients Treated, Symptom Improvement, Insurance Approval)
- Add step 4 keys, new footer column keys

### 4.2 Spanish messages
**File:** `messages/es.json`
- Mirror all en.json changes with Spanish translations

---

## Phase 5: Remaining Pages (4 files, minor changes)

- `src/app/(frontend)/[locale]/about/page.tsx` — Update stats
- `src/app/(frontend)/[locale]/sinus-education/page.tsx` — Add symptoms
- `src/app/(frontend)/[locale]/[landingSlug]/page.tsx` — 4-step process
- Resources/article pages — colors auto-update

---

## Phase 6: Update CMS Seed Data to Match WordPress

**File:** `src/seed.ts`
- Update specialists: Coastal ENT (Savannah), East Texas Sinus, Florence ENT, Triangle Sinus Care, Mountain ENT
- Update with real phone numbers from WordPress site
- Update landing pages to match real locations
- Update FAQs to match WordPress FAQ content
- Drop existing data and re-run seed

---

## Phase 7: Build and Verify

1. `npm run build` — verify no TypeScript errors
2. `pm2 restart excelent-site`
3. Verify all 9 routes return 200
4. Visual check against WordPress site
5. Check both `/en` and `/es` locales

---

## Files Changed Summary

| # | File | Change Type |
|---|------|------------|
| 1 | `tailwind.config.js` | Color palette + font swap |
| 2 | `src/app/globals.css` | Button styles |
| 3 | `src/app/(frontend)/[locale]/layout.tsx` | Font import |
| 4 | `src/components/Footer.tsx` | Major redesign |
| 5 | `src/components/StatsSection.tsx` | Stats content |
| 6 | `src/components/ThreeStepProcess.tsx` | Add 4th step |
| 7 | `src/components/FAQ.tsx` | Default questions |
| 8 | `src/components/Header.tsx` | Nav items cleanup |
| 9 | `src/components/SpecialistCard.tsx` | New props |
| 10 | `src/components/HubSpotForm.tsx` | Hardcoded colors |
| 11 | `src/components/Hero.tsx` | Minor tweaks |
| 12 | `src/components/SymptomsSection.tsx` | **NEW** |
| 13 | `src/app/(frontend)/[locale]/page.tsx` | Section reorder |
| 14 | `messages/en.json` | Content updates |
| 15 | `messages/es.json` | Content updates |
| 16 | `src/app/(frontend)/[locale]/about/page.tsx` | Stats update |
| 17 | `src/app/(frontend)/[locale]/sinus-education/page.tsx` | Symptoms |
| 18 | `src/app/(frontend)/[locale]/[landingSlug]/page.tsx` | 4-step |
| 19 | `src/seed.ts` | Real practice data |

**Total: 18 modified files + 1 new file**
