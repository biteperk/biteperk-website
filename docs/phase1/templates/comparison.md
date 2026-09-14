# Template — comparison

Copy the frontmatter into `src/content/blog/<slug>.md` (AU) or `src/content/intl-resources/<lang>/<slug>.md` (with `lang:` and `markets:`). Keep `draft: true` until the checklist is ticked.

```yaml
---
title: "<Option A> vs <Option B> vs <Option C> for <venue type>"
description: "<120–170 chars: who each option suits, in one breath>"
publishDate: 2026-MM-DD
type: comparison
relatedSolutions: ["restaurants"]
tags: []
draft: true
---
```

## Structure

1. **Who this is for** — the decision the reader is actually making.
2. **Comparison table** — rows are what an operator feels (cost shape, answer speed, hours, bookings written vs messages taken, handover to a person). Cells are facts, not adjectives.
3. **Where each option wins** — be generous to the alternatives; a comparison that always picks us is not read twice.
4. **Where Vox sits** — status-honest, one paragraph.
5. **FAQ** (3).

Never name a third-party product that `check-truthful` lists as unshipped as if we integrate with it.

## Truthfulness checklist (every piece, before `draft: false`)

- [ ] Every number has a source in `sources:` or is arithmetic the reader can redo; no invented statistics.
- [ ] "Live" means live in Australia. Outside Australia it is a pilot programme; never "our London/Paris/Brussels/Toronto team".
- [ ] No call-audio-processed-onshore claim (`check-claims`); records are stored in Australia, live calls are processed in the US.
- [ ] No named POS/booking integration that has not shipped (`check-truthful` list); no certification or compliance claim outside the legal pages.
- [ ] No price on any global copy; the AU price appears only where the AU tree already states it.
- [ ] Customers named only with `customer.approved: true` and the approval recorded (`approvedOn`, `approvedVia`).
- [ ] `relatedSolutions` set (≥1 valid slug); `cities` set when the piece supports a city page (and the slug added to that city's `relatedGuides`).
- [ ] `seoTitle` set if the title exceeds ~60 chars; description 120–170 chars; ≥600 words.
- [ ] Regenerated: `npm run og` (per-post card) and `node scripts/build/content-inventory.mjs --out docs/phase1/CONTENT-INVENTORY.md`.
