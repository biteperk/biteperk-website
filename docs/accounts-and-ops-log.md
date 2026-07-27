# Accounts & ops log

Infrastructure changes that live **outside this repo** (registrar, DNS, CDN,
hosting consoles). If it isn't in `firebase.json` or CI, it's documented here —
this file closes the "DNS wiring documented nowhere" gap.

Conventions: newest entry first. Every entry lists exactly what was **added**
(the standing rule for third-party zones is *add only — never modify or delete
existing records*), so "after = before + this entry" always holds.

---

## 2026-07-26 (later) — www.biteperk.com.au rescued from a TLS dead end; biteperk.com Search Console property

**Context:** verification pass over the live hosts after the ccTLD work below.
Everything in that entry checked out (18/18 redirect matrix re-confirmed
independently: all 301, single-hop, path-for-path, query intact). Four things
it had not covered surfaced.

### 1. `www.biteperk.com.au` was a hard TLS failure — now fixed via Cloudflare

`www` resolved (CNAME -> apex -> Firebase `199.36.158.100`) and `http://`
301'd to `https://`, but the `biteperk` Hosting site had **only** the apex as a
custom domain, so no certificate covered `www`:
`CERTIFICATE_VERIFY_FAILED, hostname mismatch`. Worse, this zone's Firebase
HSTS header is `includeSubDomains; preload`, so for anyone who had ever
visited the AU site the bad certificate was a **non-bypassable** error.

**Root cause of why it could never be fixed on Firebase:** the `biteperk`
target's single redirect `/:path*` -> `https://biteperk.com/au-en/:path`
swallows `/.well-known/acme-challenge/<token>` along with everything else.
Firebase reported it verbatim: *"Hosting's HTTP GET request for the ACME
challenge failed: 199.36.158.100: 404 Not Found"*. (`ignore: ["**/.*"]`
compounds it.) The certificate is blocked by the redirect that makes the host
work at all.

**Fix — Cloudflare, matching the uk/fr/be pattern rather than Firebase.**
Cloudflare Universal SSL covers `*.biteperk.com.au` with no ACME round-trip,
so `www` was proxied and given its own redirect rules. Rules created **before**
the proxy flip, so the edge never fetched an origin that has no cert for `www`.

Redirect rules added to the **biteperk.com.au** zone (zone previously had
none), scoped to `www` by hostname so the apex's Firebase behaviour is
untouched:

| # | Expression | Action |
|---|---|---|
| 1 | `http.host eq "www.biteperk.com.au" and (http.request.uri.path eq "/au-en" or starts_with(http.request.uri.path, "/au-en/"))` | Dynamic 301 -> `concat("https://biteperk.com", http.request.uri.path)` |
| 2 | `http.host eq "www.biteperk.com.au"` | Dynamic 301 -> `concat("https://biteperk.com/au-en", http.request.uri.path)` |

Both preserve the query string. The `eq` + `starts_with("/au-en/")` pair is
deliberate, same reasoning as the other zones: a bare
`starts_with(path, "/au-en")` would also swallow `/au-english`.

**DNS changed (the only modification, not an addition):** `www` CNAME ->
`biteperk.com.au` flipped from **DNS-only to Proxied**. Content, name, type
and TTL untouched. Nothing else in the zone was touched — MX (zoho x3), SPF,
DKIM, `_dmarc` (`p=quarantine`), `hosting-site=biteperk`, the Google
verification TXT, and the `vocotable`/`kitchen.vocotable` CNAMEs all as they
were. Record count 13 before and after.

**Verified:** `https://www.biteperk.com.au/` -> 301 -> `/au-en/`;
`/about/` -> `/au-en/about/`; `/contact?utm_source=x` keeps the query;
`/au-en/about/` passes through to `/au-en/about/` **without** double-prefixing;
`http://www.biteperk.com.au/` renders the AU home in real Chrome.
(An earlier probe suggested a double-prefix and a 503 on `http` — the first was
edge-propagation lag, the second was a sandbox HTTP proxy artifact. Neither is
real. `Always Use HTTPS` was therefore left **off** on this zone, unlike
uk/fr/be, since the redirect rules already answer http single-hop.)

**Left in place, deliberately:** `www.biteperk.com.au` is still listed as a
custom domain on the `biteperk` Hosting site (it now reads Connected). It is
inert — Cloudflare answers `www` at the edge and Firebase never sees the
traffic. Removing it is tidiness, not a fix. Two mechanisms for one host is
worth cleaning up when convenient.

### 2. ⚠️ OPEN RISK — the apex certificate renewal has the same exposure

`biteperk.com.au` (apex) only holds a valid Firebase certificate because it was
minted *before* the redirect-only build went live. Renewal walks the same ACME
path the `/:path*` catch-all swallows. If it fails, the apex — carrying the
indexed AU content — goes dark with a certificate error.

Not yet mitigated. The clean end state is to treat the apex exactly like `www`
and the other ccTLDs: Cloudflare-proxied with redirect rules, removed from
Firebase Hosting, `dist-cctld` and the `biteperk` target retired. That would
make **every** ccTLD front door Cloudflare-managed and leave no Firebase
certificate to renew on this domain. Decision pending.

### 3. `biteperk.com` Search Console property created

There was **no** property for `biteperk.com` — only `biteperk.com.au`,
`algorythmos.com`, `australianscare.com.au`. So the destination of the
`.com.au` -> `.com/au-en/` migration had zero coverage.

Added as a **Domain** property, verified by TXT. Google offered to OAuth into
the whole Cloudflare DNS account to do it automatically; declined in favour of
`Any DNS provider` and one record added by hand.

TXT **added** to the biteperk.com zone (add-only; the three existing TXTs
untouched, 12 -> 13 records):

`biteperk.com  TXT  google-site-verification=AfMoTScHe2a1zxgile-1oopCfbCN4yhvJ5L-gei_jP0`

Ownership verified; `https://biteperk.com/sitemap-index.xml` submitted, status
**Success** (68 URLs: au-en 33 + en/gb-en/fr/be-en/be-fr 7 each).

Note on Change of Address: Google documents that tool for domain-to-domain
moves. Moving into a **subdirectory** of another domain is not covered, so the
301s do the work and this property is the only way to watch it happen.

### 4. `robots.txt` pointed crawlers at two 404s (repo fix)

`biteperk.com/robots.txt` advertised
`/au-en/sitemap-index.xml` and `/au-en/llms.txt` — both 404. The real files are
at the root and return 200. `merge-dist.mjs` blanket-rewrote every
`biteperk.com.au` to `<origin>/au-en`, which is right for page references and
wrong for the root-only files. The machine `Sitemap:` directive was already
correct, so only the comment lines were affected — on a robots.txt that
explicitly welcomes GPTBot/ClaudeBot, exactly the readers those lines serve.

Fixed on branch `fix/robots-root-files-and-au-apex-301`, together with an
explicit `/` -> `/au-en/` 301 for the apex (`/:path*` does not match the empty
path, so the homepage was falling through to a **meta-refresh** — the weakest
redirect signal on the highest-authority URL of the migrating domain).
**Not yet built or deployed.**

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
