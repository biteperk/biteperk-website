# Canada readiness — `/ca-en` + `/ca-fr` (registered 13 Sep 2026, status `planned`)

Canada is registered in `src/data/locales.ts` as two **planned** locales. Nothing is built, linked, listed or indexed for them (`check-planned` proves it on every merged build), but every downstream surface is already typed for them: `Market` includes `"ca"`, the compliance registry has a `ca` entry, seven city stubs sit in `intl/cities.ts` with `published: false`, and the truthful gate already bans a fabricated `+1` number and "our Toronto team".

**Launching Canada is a single decision** — flipping `status` on both locales in the same commit — and this checklist is what must be true first. Each row names the gate that will fail if it is skipped.

## Non-negotiables (both locales, one release)

| # | Item | Why | Owner | Gate |
|---|---|---|---|---|
| 1 | `ca-en` and `ca-fr` flip **together** | Québec's Charter of the French Language (Bill 96) — a commercial site addressing Québec must be available in French of equal quality; launching `ca-en` first would be the wrong first impression in Montréal | Sam | `locale-planned.test.mjs` (shared status) |
| 2 | **Québécois reviewer** named and the `ca-fr` batch passed | The `fr` core is metropolitan French (Ludovic, France). It would ship word-for-word to Montréal: *souper/dîner*, *courriel*, *dépanneur*, *cellulaire*, the 24-hour clock in copy, `vous`-register norms differ. Ludovic is not the reviewer for this | Sam | none — a human gate; file under `docs/ops-records/` like the French ones |
| 3 | Decide the `ca-fr` copy model: **fourth core `copyLang: "fr-CA"`** or **override on the `fr` core** | An override keeps one French SSOT and patches vocabulary; a core is cleaner but doubles the French review surface forever. Recommendation: override first, promote to a core only if the override grows past ~40% of the bundle | Claude + Sam | `intl-merge` parity test (either way the shape must match) |
| 4 | Differentiated **home + about** for both Canadian trees | `check-intl-similarity` pools by language: `ca-en` is scored against `/en`, `/gb-en`, `/be-en`; `ca-fr` against `/fr`, `/be-fr` (35% ceiling, currently 31% worst). Two more trees reciting the same demo will fail | Claude | `check-intl-similarity` |
| 5 | Compliance wording reviewed by counsel | `ca` entry: OPC (federal, PIPEDA) + CAI (Québec, Law 25), CASL for outbound email. Law 25 has *privacy-by-default* and *privacy impact assessment for transfers outside Québec* duties the notice must state plainly — the data goes to Australia and the US | Natalia (Integrant) | `check-market-disclosure` (extend with a `ca` floor when live) |
| 6 | Trust-panel facts for `ca` | Authority row (OPC / CAI), time-zone note ("Sydney is 14–17 hours ahead of Canada — a morning enquiry is usually answered the same evening, your time"), records line naming the Australia/US transfer | Claude | `intl-compliance.test.mjs`, `intl-feel-local.test.mjs` |
| 7 | `firebase.json` shortcuts `/ca` → `/ca-en/` (and `/qc` → `/ca-fr/`?) | Mirror `/gb`, `/be`; the `staging` block is regenerated from the production block, never hand-edited | Claude | `check-hosting`, `check-staging-hosting` |
| 8 | Hero + market band photography for both trees; seven cityscapes | Geography-neutral heroes, real cityscapes (Toronto, Vancouver, Calgary; Montréal, Québec, Laval, Longueuil), graded with `GRADE_ONLY`, AVIF under the cityscape caps, pixel-reviewed against `docs/art-direction.md` | Claude + Sam | `check-cities` (weight caps), `check-assets` |
| 9 | Call simulation **off** on both Canadian homes at launch | The demo lowers similarity only when it sits on one side of a comparison; on `ca-en` it would push the English pool over the ceiling. Revisit with measurement | Claude | `check-intl-similarity` |
| 10 | The `/fr` tree claims generic `hreflang="fr"` today | Decide whether `/fr` keeps the generic `fr` code (a Canadian French searcher on google.ca would then be steered to France) or `ca-fr` takes `fr-CA` only and `/fr` drops the bare `fr`. Recommendation: keep `fr` on `/fr` until `ca-fr` has cities, then revisit with Search Console data | Sam | `check-hreflang` |
| 11 | Contact function: `Country/Market` mapping for `ca-*` leads; `.com` sender identity | `COUNTRY_BY_LOCALE` in `functions/pages.js` and the Zoho `Market` value; correspondence from `@biteperk.com` (domain-by-audience rule) | Claude | `contact-function-contract.test.mjs` |
| 12 | Currency and phone strategy stated once | No CAD amounts anywhere (rate card is per-pilot); no `+1` number (no Canadian line exists); `check-truthful` already bans both shapes | Claude | `check-truthful` |
| 13 | Search Console: property per tree, sitemap resubmit, `ca` targeting | After the flip, not before | Sam | manual |
| 14 | `biteperk.ca` — register only at launch | Not before: an unresolving ccTLD in `sameAs` is worse than none | Sam | `check-schema` (sameAs resolves) |

## What the flip does automatically

`status` removed from both entries → `locales` includes them → routes, `pagesForLocale`, hreflang clusters (`en-CA`, `fr-CA`), sitemap entries, locale picker, footer region links, region router on `/en`, OG cards (`BUILD_TARGET=global npm run og`), llms sections, web manifests, `check-*` expectations and the intl browser suites all derive. `check-planned` then has nothing planned and **fails on purpose** — delete it or register the next planned market in the same PR.

## Open questions recorded

- Fourth core vs override for Québec French (row 3).
- Whether Canadian cities are the right unit, or provinces (`IntlCity` needs a unique cityscape + districts — cities it is, for now).
- Whether `/en` should route Canadian visitors by `navigator.languages` (`en-CA` / `fr-CA`) once the trees exist — `LocaleSuggest` already matches primary subtags.
