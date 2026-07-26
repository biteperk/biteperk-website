# Accounts & ops log

Infrastructure changes that live **outside this repo** (registrar, DNS, CDN,
hosting consoles). If it isn't in `firebase.json` or CI, it's documented here —
this file closes the "DNS wiring documented nowhere" gap.

Conventions: newest entry first. Every entry lists exactly what was **added**
(the standing rule for third-party zones is *add only — never modify or delete
existing records*), so "after = before + this entry" always holds.

---

## 2026-07-26 — ccTLD front doors: biteperk.uk / biteperk.fr / biteperk.be → biteperk.com (Cloudflare)

**What:** The three European country-code domains now 301 into the market trees
on biteperk.com, Accenture-style. All redirect logic lives in **Cloudflare
Redirect Rules** on each zone — deliberately **not** in `firebase.json`
(`biteperk.com.au` remains the sole Firebase-hosted redirect host, untouched).

**Cloudflare account:** skalaliya@gmail.com (dash account hash
`9e2a0d9444d4681383692497481f5d51`). Zones: `biteperk.uk`, `biteperk.fr`,
`biteperk.be` (Free plan).

### Mapping

| Front door (apex + www, http + https) | 301 target |
|---|---|
| `biteperk.uk{path}` | `https://biteperk.com/gb-en{path}` |
| `biteperk.fr{path}` | `https://biteperk.com/fr{path}` |
| `biteperk.be{path}` | `https://biteperk.com/be-en{path}` (English default; `/be-fr` reachable via passthrough) |

Query strings preserved. Verified single-hop from both schemes and both hosts
(18/18 matrix: one 301, correct Location, query intact, final 200).

### Redirect rules (identical structure on all three zones, in this order)

**Rule 1 — "Canonical-path passthrough"** (custom filter expression; prevents
double-prefixing when someone hits a front door with an already-canonical path,
e.g. `biteperk.be/be-fr/contact`). The `eq` + `starts_with` pairs deliberately
avoid a bare `starts_with(path, "/fr")` matching `/fresh-menu`:

```
http.request.uri.path eq "/en" or starts_with(http.request.uri.path, "/en/") or http.request.uri.path eq "/gb-en" or starts_with(http.request.uri.path, "/gb-en/") or http.request.uri.path eq "/fr" or starts_with(http.request.uri.path, "/fr/") or http.request.uri.path eq "/be-en" or starts_with(http.request.uri.path, "/be-en/") or http.request.uri.path eq "/be-fr" or starts_with(http.request.uri.path, "/be-fr/") or http.request.uri.path eq "/au-en" or starts_with(http.request.uri.path, "/au-en/")
```

Type: Dynamic · target `concat("https://biteperk.com", http.request.uri.path)`
· 301 · preserve query string.

**Rule 2 — "Market catch-all"** (all incoming requests). Type: Dynamic ·
target `concat("https://biteperk.com/<base>", http.request.uri.path)` where
`<base>` is `gb-en` (uk) / `fr` (fr) / `be-en` (be) · 301 · preserve query
string.

Single Redirects run **before** "Always Use HTTPS" in Cloudflare's phase
order, and the targets are absolute https URLs — that is what makes http
requests single-hop.

### DNS records added (add-only; nothing modified or deleted)

**biteperk.uk** — zone had 5 pre-existing GoDaddy-era records including MX and
a DMARC `p=quarantine`. Per the add-only rule those were left untouched (the
existing DMARC was NOT tightened to `p=reject` — flagged as a deliberate
deviation from the parked-domain lockdown). Added:

- A `@` → `192.0.2.1` (TEST-NET placeholder, **proxied** — edge answers, origin never contacted)
- CNAME `www` → `biteperk.uk` (**proxied**)
- TXT `*._domainkey` → `v=DKIM1; p=`
- (SPF: zone already carried SPF-relevant records; only the missing pieces were added)

**biteperk.fr** and **biteperk.be** — zones were empty. Full parked-domain set
added to each:

- A `@` → `192.0.2.1` (proxied)
- CNAME `www` → apex (proxied)
- TXT `@` → `v=spf1 -all`
- TXT `_dmarc` → `v=DMARC1; p=reject; adkim=s; aspf=s;`
- TXT `*._domainkey` → `v=DKIM1; p=`

### Edge settings (all three zones)

- Always Use HTTPS: **on**
- HSTS: **on**, `max-age=15552000` (6 months), includeSubDomains **off**, no
  preload submission.
- **Observed quirk:** Cloudflare does not attach the zone HSTS header to
  edge-generated redirect responses — and every response on these zones IS a
  redirect, so `Strict-Transport-Security` never appears in curl output despite
  the setting being enabled. Accepted: http→https is single-hop and the
  destination (biteperk.com) serves its own HSTS from Firebase.

### Not done (out of scope, deliberate)

- No Search Console properties for the ccTLDs (they never serve content).
- No email/MX on the new domains.
- `biteperk.com.au` stays on Firebase (`dist-cctld/`), unchanged — verified.
- `INTL_LAUNCHED` untouched (still gated on Ludovic's French review).

### Repo follow-up (same date, one commit)

`locales.ts` gained `cctld?` per locale (SSOT for the front doors);
`schema.ts` derives the org `sameAs` ccTLD list from it; CLAUDE.md + README
note that uk/fr/be redirects live in Cloudflare, not firebase.json.
