# Template — faq

Copy the frontmatter into `src/content/blog/<slug>.md` (AU) or `src/content/intl-resources/<lang>/<slug>.md` (with `lang:` and `markets:`). Keep `draft: true` until the checklist is ticked.

```yaml
---
title: "<The question, as a searcher types it>?"
description: "<120–170 chars: the answer in one sentence, then the nuance>"
publishDate: 2026-MM-DD
type: faq
relatedSolutions: ["restaurants"]
tags: []
draft: true
---
```

## Structure

- **The answer first** (≤40 words, quotable on its own).
- **The nuance** — when it is different, for whom.
- **Related questions** — 2–4, each one sentence.

Source of questions: Search Console queries with impressions and low CTR, and what venues actually ask on demo calls.

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
