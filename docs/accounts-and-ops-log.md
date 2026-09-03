# Accounts & ops log

Infrastructure changes that live **outside this repo** (registrar, DNS, CDN,
hosting consoles). If it isn't in `firebase.json` or CI, it's documented here —
this file closes the "DNS wiring documented nowhere" gap.

Conventions: newest entry first. Every entry lists exactly what was **added**
(the standing rule for third-party zones is *add only — never modify or delete
existing records*), so "after = before + this entry" always holds.

---

## 2026-07-27 — biteperk.com.au apex moved to Cloudflare; the ACME renewal risk is closed

**Why:** the apex held a Firebase GTS certificate expiring **22 Oct 2026**, and
Firebase renews ~30 days out. Renewal walks `/.well-known/acme-challenge/`,
which the `biteperk` target's `/:path*` catch-all swallows — re-measured
immediately before this change:

```
https://biteperk.com.au/.well-known/acme-challenge/testtoken
  -> 301 https://biteperk.com/au-en/.well-known/acme-challenge/testtoken
```

With Firebase HSTS `includeSubDomains; preload`, a failed renewal would have
taken the indexed AU host dark **non-bypassably** — the same failure already
suffered on `www` (entry below). Done in a calm window rather than under
deadline in late September.

**Precondition checked first (never previously recorded):** zone SSL/TLS
**encryption mode = Full**, automatic mode disabled. Full rather than Full
(Strict) is the better of the two here — it does not validate the origin
certificate, so the Firebase fallback keeps working even after that certificate
lapses in October.

### What changed — two edits, nothing else

**1. Both existing redirect rules widened** from `http.host eq
"www.biteperk.com.au"` to `http.host in {"www.biteperk.com.au"
"biteperk.com.au"}`. Still **2 rules, not 4**. Renamed to `canonical-path
passthrough (apex + www)` and `market catch-all to au-en (apex + www)`; order
preserved (passthrough first). Landed **before** the proxy flip, so they were
inert while the apex was grey-clouded — verified inert at the time by the apex
still exhibiting its Firebase-side double-prefix bug.

**2. Apex `A` flipped DNS-only -> Proxied.** Value stays `199.36.158.100`;
name, type and TTL untouched. Record count 13 before and after.

### Verified after the flip

| Check | Result |
|---|---|
| apex + www x `/`, `/about/`, `/au-en/about/`, `?utm_source=x`, a blog path | all **single-hop 301**; apex and www now identical |
| trailing slash | **fixed** — `/about/` -> `/au-en/about/` (Firebase dropped it) |
| double-prefix | **fixed** — `/au-en/about/` no longer doubles |
| `http://` scheme | single-hop straight to `https://biteperk.com/au-en/...` |
| MX | unchanged: `10 mx.zoho.com.au` / `20 mx2` / `50 mx3` |
| apex A | now Cloudflare edge (`104.21.15.246`, `172.67.165.86`) |
| booking app | `vocotable` + `kitchen.vocotable` both 200 (separate DNS-only CNAMEs) |
| AU content | `biteperk.com/au-en/**` 200, indexable, self-referential canonicals |
| real browser | `http://biteperk.com.au/about/` renders `/au-en/about/`, no warning |

**Two latent bugs fixed as a side effect** — the trailing-slash drop and the
double-prefix both came from `firebase.json`'s `:path` substitution.

**Not verified from the sandbox, flagged:** the edge certificate chain (this
environment intercepts TLS and re-signs, so `openssl` reports a proxy cert) and
actual Zoho mail delivery (unchanged MX resolution is the proxy for it). Confirm
the padlock and send one test mail.

**Rollback:** flip the apex `A` back to DNS-only. One toggle, instant.

### Deliberately kept, not retired

The Firebase `A` value and the apex custom domain both stay. If a rule ever
misfires, Cloudflare falls back to fetching Firebase, which still serves its own
301s — and under SSL mode Full that fallback survives the October lapse.
Retiring the `biteperk` target, `dist-cctld/` and the `merge-dist` writer is
optional cleanup once this has been stable.

**Repo consequence:** `firebase.json`'s apex `/` -> `/au-en/` 301 (added in
`ad98d4f`) is now belt-and-braces rather than the live path. CLAUDE.md lines ~48
and ~66 still call `biteperk.com.au` the one Firebase-hosted redirect exception;
that is now true only as a fallback.

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

---

## 7 Aug 2026 — Biteperk Ltd (UK) incorporated; social profiles published

### Company

Verified directly against Companies House, not the handover email:

| | |
|---|---|
| Legal name | BITEPERK LTD |
| Company number | **17379647** |
| Status | Active, private limited company |
| Incorporated | 4 August 2026 |
| Registered office | 124 City Road, London, England, EC1V 2NX |
| SIC | 62012, 62020, 63110 |
| Record | https://find-and-update.company-information.service.gov.uk/company/17379647 |

**It is a registered office, not a premises.** No UK staff, no UK phone line, no
VAT registration. The Europe-truthful rules are unchanged by it — see CLAUDE.md.

**Do not republish aggregator data.** Endole and similar sites show "Micro ·
turnover under £1M · under 10 employees" for this company. That is an
*inference*: it has filed no accounts (first due 4 May 2028). Companies House is
the only source we cite.

### Site changes (branch `feat/social-profiles`)

Scoped to `/gb-en` and nothing else: footer statutory disclosure on every page,
a new `legal/company-details` page, the `#uk` JSON-LD node, and market-scoped
privacy/terms naming Biteperk Ltd as controller and contracting party. New gate
`check-uk-disclosure.mjs` in `gates:global`; `check-schema` now asserts the UK
node is present on `/gb-en` and **absent** on the other four trees.

### ⚠️ Open obligations — owner: Sam (+ counsel)

These follow from naming Biteperk Ltd as UK controller and contracting party.
The site changes above should NOT deploy until at least 1 and 2 are resolved.

1. **Counsel review** of `/gb-en` privacy, terms and company-details copy.
   The wording is drafted to be accurate and complete; it is not a substitute
   for review. Interacts with the "full GDPR-aligned notice being finalised with
   counsel" already promised in `src/data/intl/copy.ts`.
2. **ICO registration + data protection fee.** Statutory, not optional. Tier 1
   (micro): £52, or £47 by direct debit — qualifying at ≤£632k turnover or ≤10
   staff. Publish the registration number in the `/gb-en` privacy notice once
   issued.
3. **IDTA / UK Addendum + Transfer Risk Assessment** for UK→AU (Firestore) and
   UK→US (voice platform). The UK has no adequacy regulations for Australia and
   a TRA is mandatory. The privacy copy currently says these are being put in
   place — keep that honest, and correct it the day they are.
   Watch item: the ICO has said it will update the IDTA and Addendum during 2026.
4. **Article 28 processor agreement** with each UK venue. For call data the
   venue is controller and BitePerk is processor. This is the obligation that
   actually bites once a UK pilot signs.
5. **Provision/monitor the published email.** `sales@biteperk.com` is published
   as the reg 6(1)(c) contact. An unread address there is a compliance failure.
   Swap `ukEmail` in `src/data/site.ts` if a dedicated UK mailbox is created.
6. **Registered-office mail forwarding must be live.** ECCTA requires an
   "appropriate address" since 4 Mar 2024 — delivered documents must reach
   someone acting for the company. 124 City Road is a formation-agent address.
7. **Registered email address at Companies House** (ECCTA, since 4 Mar 2024) —
   confirm it is one that is actually read.
8. **Filing deadlines:** confirmation statement due **17 Aug 2027**; first
   accounts to 31 Aug 2027, due **4 May 2028**.
9. **PECR reg 22 for UK outbound.** The corporate-subscriber exemption covers
   limited companies and LLPs but **not** sole traders or partnerships.

### Social profiles

Four accounts confirmed live and published to the org `sameAs` on both builds;
three render in the footer. Instagram is in `sameAs` but `visible: false` — it
had 0 posts and 0 followers on 7 Aug 2026. Flip the flag in `src/data/site.ts`
once seeded.

| LinkedIn | https://www.linkedin.com/company/biteperk |
| YouTube | https://www.youtube.com/@biteperk |
| Facebook | https://www.facebook.com/biteperk/ |
| Instagram | https://www.instagram.com/biteperk/ |

Post-deploy: re-scrape LinkedIn Post Inspector and Facebook Sharing Debugger.

## 3 Sep 2026 — International contact form: privacy position and sign-off

PR #26 (Zoho CRM + Google Ads conversion tracking on all five biteperk.com
locales) was held for a "legal review" that had no reviewer behind it: the
v3.0 legal pack prepared for Natalia's second pass (25 Aug) had not been sent,
and its website privacy/cookie drafts do not mention Zoho CRM, Google Ads or
the contact-form data flow at all. Rather than wait on a document describing
a site that no longer exists, the position below was fixed in code, checked
sentence-by-sentence against `functions/index.js`, and accepted.

**Decision (Sam, 3 Sep 2026, as controller):** the contact-form privacy
position stated on `/en`, `/gb-en`, `/fr`, `/be-en`, `/be-fr` is accepted as a
documented business decision for a low-risk B2B enquiry form, and PR #26 may
merge on it. The corrected privacy + cookie texts replace
`3-Website-Publish-Layer/03` and `04` in the v3.0 bundle, and four questions
are added to the memo's decisions table (§5, items 3d–3g) for Natalia's
confirmation in her existing second pass — not a new engagement.

**What changed in code (PR #26):**

- Google reCAPTCHA removed from the international form. It loaded before any
  consent on every EU/UK contact page and sent each visitor's IP to Google
  (CNIL fined Cityscoot €125k for reCAPTCHA-without-consent, 2023); the AU
  form has never used a CAPTCHA. Replaced by the existing honeypot plus a
  per-connection rate limit in the function (5 posts / 10 min, keyed by
  sha256(IP), counter expires with the window).
- Lead notification CC changed from `biteperk@gmail.com` (personal Gmail — an
  undisclosed transfer of every lead's full details to Google, US) to the
  Zoho-hosted `sales@biteperk.com`.
- Visitor IP address and user agent no longer stored on the lead. Nothing
  ever read them back.
- Retention: every lead now carries `expireAt` = created + ~24 months, with a
  Firestore TTL policy declared in `firestore.indexes.json` (`fieldOverrides`
  → `ttl: true` on `contactSubmissions.expireAt` and `rateLimits.expireAt`)
  and deployed with `firebase deploy --only firestore:indexes` (Firebase CLI
  ≥ 15 manages TTL from that file; confirmed on 15.24.0). Fallback:
  `gcloud firestore fields ttls update expireAt
  --collection-group=contactSubmissions --database=biteperk-leads
  --project=vocotable --enable-ttl`. Verify with
  `gcloud firestore fields ttls list --database=biteperk-leads`.
  **TTL policy deployed: ☑ 3 Sep 2026** — `firebase deploy --only
  firestore:indexes --project vocotable` run from Sam's Mac on Sam's
  instruction; `firebase firestore:indexes --database biteperk-leads` then
  showed `ttl: true` on `contactSubmissions.expireAt` and
  `rateLimits.expireAt`. The "up to 24 months" sentence is now a fact.
  PR #26 merged (rebase) and deployed the same day via
  `deploy-firebase.yml` (functions → hosting), run 33701251750.
- Privacy notice on every locale now states: controller (Biteperk Pty Ltd,
  ABN, Sydney — no street address; `check-truthful` bans the NAP on global
  pages), lawful basis (Art 6(1)(f)), named recipients with locations
  (Firestore AU, Zoho CRM AU, Zoho Mail), the transfer to Australia with an
  honest "no SCC signed yet" sentence, 24-month retention, the full GDPR
  rights list, and the market's supervisory authority (CNIL / APD-GBA / ICO).
  The "being finalised with counsel" promise is gone. Cookie policy and the
  live settings panel no longer describe reCAPTCHA as strictly necessary.
- Verified facts behind the copy: Firestore `biteperk-leads` is in
  `australia-southeast1` (checked against the live database, not a comment);
  the Zoho org `biteperkau` is on the Australian data centre; 51 leads held,
  6 from the international form, on 3 Sep 2026.

**Open, owner Sam (each is one action):**

1. Deploy order: `firebase deploy --only functions:biteperk-website`, then
   `--only firestore:indexes`, then hosting. Functions first so the old page
   keeps working during the gap.
2. Zoho CRM → Setup → Users & Control → Compliance Settings → enable GDPR
   (`privacy_settings` was `false` on 3 Sep).
3. Zoho DPA: email legal@zohocorp.com for the DPA (EU SCCs Module 2 + UK
   Addendum), stating the account is on the **AU data centre**. When
   countersigned, flip the `TODO(legal)` sentence in `copy.ts` (EN + FR) and
   `markets.ts` (gb-en), and log it here.
4. ICO registration + fee for Biteperk Ltd (open obligation #2 above).
5. `firebase functions:secrets:destroy RECAPTCHA_SECRET_KEY` and delete the
   `PUBLIC_RECAPTCHA_SITE_KEY` repository variable once the new function is
   live — both are unused now.
6. ~~Ludovic's pass on the new French~~ — **done 3 Sep 2026.** Ludovic Roux
   gave a **verbal** pass on the 3 Sep privacy/cookie French (the `privacy.fr`
   core, the cookies "Strictement nécessaires" sentence, and the CNIL /
   APD-GBA sentences in `markets.ts`), confirmed by Sam. Recorded as verbal on
   purpose: unlike the 26 and 27 Jul sign-offs there is no email behind it.
   The `⚠️ DRAFT French` markers are removed and the sign-off is noted in
   `src/data/intl/copy.ts`'s header. Comment-only change — the built HTML is
   byte-identical, verified by diffing a before/after `dist-global/`, so no
   redeploy was needed.
