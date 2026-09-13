# Template — product-update

Copy the frontmatter into `src/content/blog/<slug>.md` (AU) or `src/content/intl-resources/<lang>/<slug>.md` (with `lang:` and `markets:`). Keep `draft: true` until the checklist is ticked.

```yaml
---
title: "<What shipped>, <month year>"
description: "<120–170 chars>"
publishDate: 2026-MM-DD
type: product-update
relatedSolutions: ["restaurants"]
tags: []
draft: true
---
```

## Structure

1. **What shipped** — status per `products.ts` (`live` / `in-development` / `concept`), nothing ahead of it.
2. **Why** — the operator problem behind it.
3. **What it does not do yet** — say it.
4. **How to get it** — for existing customers; for prospects, the demo/pilot path.

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
