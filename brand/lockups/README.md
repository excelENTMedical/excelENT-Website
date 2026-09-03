# PS | PRODUCT lockups

Exported 2026-09-03 from `src/lib/social/graphics/layout/primitives.tsx` (`Lockup`) — the same
component that draws the mark on the social graphics, rendered standalone through satori. These are
the shipped mark, not a redraw.

Regenerate after any change to `Lockup`, `theme.ts` or `brands.ts`:

```
node --import tsx scripts/export-lockups.tsx
```

## Files

| | |
|---|---|
| `<brand>-lockup.svg` | rule + wordmark + descriptor — the full mark |
| `<brand>-wordmark.svg` | rule + wordmark only, no descriptor |
| `<brand>-*-512w.png` / `-1024w.png` / `-2048w.png` | transparent PNG at that pixel width |

Brands: `ps-rcm`, `ps-lexi`, `ps-connect`.

SVG text is outlined to paths, so nothing needs Cabin installed to render correctly. Mask ids are
namespaced per file, so two of these can be inlined in one HTML document without colliding.

## Colours

| Part | Token | Hex |
|---|---|---|
| Rule, `PS`, descriptor | `navy` | `#061b42` |
| Product word | `purple` | `#89007a` |
| `\|` separator | `lav3` | `#919be7` |

Note: `theme.ts` documents the lavenders as decoration only, "never type … or the PS \| PRODUCT
lockup," yet the separator uses `lav3`. The rendered mark is what was approved; the comment is the
thing that is out of date. Flagged rather than changed.

## Proportions

Drawn at `size = 40`: the rule is 4 × 76px with a 24px gap, the wordmark is Cabin Bold 40, the
descriptor is Cabin SemiBold 14 with 0.22em tracking, 8px below. Descriptor metrics are fixed
pixels rather than multiples of `size`, so re-exporting at a different `size` changes the
proportions. Scale the SVG instead.

## Descriptor provenance

Only **`REVENUE CYCLE MANAGEMENT`** came off the client's own approved graphic.

`FRONT DESK SUPPORT` (Lexi) and `PATIENT ACQUISITION` (Connect) are placeholders awaiting client
wording, flagged as `descriptorConfirmed: false` in `src/lib/social/graphics/brands.ts`. The
wordmark-only files carry no such risk.
