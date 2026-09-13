# Template — industry-report

Copy the frontmatter into `src/content/blog/<slug>.md` (AU) or `src/content/intl-resources/<lang>/<slug>.md` (with `lang:` and `markets:`). Keep `draft: true` until the checklist is ticked.

```yaml
---
title: "<Topic>: <period> report"
description: "<120–170 chars>"
publishDate: 2026-MM-DD
type: industry-report
relatedSolutions: ["restaurants"]
sources:
  - title: "<dataset or publication>"
    url: "https://…"
    accessed: 2026-MM-DD
tags: []
draft: true
---
```

## Structure

1. **Headline finding** — one number, sourced.
2. **Method** — where the data came from, its limits. Our own call data only in aggregate and only with the venues' permission.
3. **Findings** — 3–5, each with a chart or table and its source.
4. **What operators should do** — practical, not promotional.

The build refuses `draft: false` without at least one `sources` entry. No "industry report" ships on opinion.

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
