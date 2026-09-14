# Template — case-study

Copy the frontmatter into `src/content/blog/<slug>.md` (AU) or `src/content/intl-resources/<lang>/<slug>.md` (with `lang:` and `markets:`). Keep `draft: true` until the checklist is ticked.

```yaml
---
title: "<Venue>: <what changed on the phone>"
description: "<120–170 chars>"
publishDate: 2026-MM-DD
type: case-study
relatedSolutions: ["restaurants"]
cities: ["sydney"]
customer:
  name: "<person quoted>"
  venue: "<venue>"
  city: "<city>"
  approved: false
  approvedOn: 2026-MM-DD
  approvedVia: "<email / signed form — where the record is>"
sources: []
draft: true
---
```

## Structure

1. **The venue** — size, service shape, what the phone was like before (their words).
2. **What we set up** — plainly: forward, rules, which product, what stayed with the team.
3. **What changed** — one real number if the venue will give one; otherwise the operator's own description. No invented metrics.
4. **The quote** — verbatim, approved.
5. **What we would tell a similar venue.**

The build refuses `draft: false` until `customer.approved: true`. Approval means a written record we can point to.

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
