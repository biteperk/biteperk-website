# Template — guide

Copy the frontmatter into `src/content/blog/<slug>.md` (AU) or `src/content/intl-resources/<lang>/<slug>.md` (with `lang:` and `markets:`). Keep `draft: true` until the checklist is ticked.

```yaml
---
title: "How to <outcome> at your <venue type>"
seoTitle: "<≤60 chars if needed>"
description: "<120–170 chars: the problem, the promise, no hype>"
publishDate: 2026-MM-DD
type: guide
relatedSolutions: ["restaurants"]
cities: []
tags: []
draft: true
---
```

## Structure

1. **The moment** (2–3 sentences): a specific service situation the reader recognises.
2. **What it costs / why it happens** — one worked example with the reader's own numbers.
3. **What to do about it** — 3–5 concrete steps; the phone is one of them, not all of them.
4. **Where Vox fits** — one paragraph, honest about status (`live` products only).
5. **FAQ** (3 questions) — short, citeable answers.

Link one city page in the body when the guide is city-support content, and one solution page always.

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
