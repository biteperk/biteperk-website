# Accounts & ops log

Infrastructure changes that live **outside this repo** (registrar, DNS, CDN,
hosting consoles). If it isn't in `firebase.json` or CI, it's documented here —
this file closes the "DNS wiring documented nowhere" gap.

Conventions: newest entry first. Every entry lists exactly what was **added**
(the standing rule for third-party zones is *add only — never modify or delete
existing records*), so "after = before + this entry" always holds.

---

## 2026-09-07 — regulator correspondence filed in the repo (`docs/ops-records/`)

Four PDFs had been sitting untracked in the working copy since August — real
approvals with nothing recording that they existed, and nothing stopping a
machine rebuild from losing them. They are now committed:

| File | What it is |
|---|---|
| `2026-08-12-alphanumeric-sender-id-submission-req-28926493.pdf` | Alphanumeric Sender ID submission for BitePerk in AU (request #28926493) |
| `2026-08-18-sms-sender-id-participate-approved.pdf` | SMS Sender ID Register — application to **participate** approved |
| `2026-08-18-sms-sender-id-register-approved.pdf` | SMS Sender ID Register — application to **register the sender ID** approved |
| `2026-08-18-duns-number-update-case-34761901.pdf` | DUNS number update completed (case #34761901) |

**This is a deliberate exception to `.gitignore`'s "Local business documents —
never repo content" rule**, and the exception is narrow: these are *regulator
and registry correspondence cited as evidence*, they carry no credentials, and
losing them means re-applying rather than re-downloading. Company registration,
client files and anything with credentials in it stay outside the repo as
before — the rule is unchanged, this is one scoped carve-out, noted in
`.gitignore` itself so the next person sees the reasoning at the point of
decision.

Also in the same pass: `Expenses/`, `Opal-Transport/` and `Socials/` (personal,
not site content) are now gitignored rather than sitting untracked at the repo
root, and `~$*` is ignored so Office lock files stop masquerading as real files
— one had been in `marketing/` since 31 Jul.

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

> **COUNSEL REVIEW DISCHARGED — 3 Sep 2026.** Natalia (Integrant) reviewed the
> contact-form privacy packet (item 15) and **passed it as drafted**, with all
> four questions confirmed:
> **3d** legitimate interests, Art 6(1)(f), is the right basis for answering a
> B2B enquiry the visitor initiated · **3e** keep publishing the honest "no
> transfer safeguard signed yet" line and keep the Zoho push running, rather
> than suspending it for EU/UK visitors until the DPA lands · **3f** the
> "putting an IDTA/UK Addendum and TRA in place" wording is acceptable while
> they are executed, and ICO registration may follow publication · **3g** "up
> to 24 months, earlier on request" needs no further review criterion.
> Relayed verbally by Sam; there is no written opinion, which is the
> provenance if the wording is ever questioned. This is the gate that had
> blocked PR #26 since 2 Sep.
>
> **What it does NOT discharge:** the three `TODO(legal)` sentences. Those turn
> on Zoho countersigning the DPA (and, for `/gb-en`, the IDTA/UK Addendum and
> TRA actually being executed) — facts about the world, not review status.
> They stay until the paperwork is signed.

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
5. ~~`firebase functions:secrets:destroy RECAPTCHA_SECRET_KEY` and delete the
   `PUBLIC_RECAPTCHA_SITE_KEY` repository variable~~ — **done 3 Sep 2026.**
   Verified first with `gcloud functions describe` that the deployed
   `contactForm` binds only `ZOHO_SMTP_PASS` and `analyticsEvent` binds
   nothing, so the secret was provably orphaned. Secret now `DESTROYED`
   (v1), repo variable deleted, and an invalid POST to `/api/contact` still
   returns 400 — the function is healthy without them. Recoverable if ever
   needed: the key pair still exists in Google's reCAPTCHA admin console.

### 3 Sep 2026 — Zoho CRM GDPR compliance settings ENABLED

Setup → Security Control → Compliance Settings → **Enable GDPR Compliance**,
configured as: modules **Leads, Contacts**; consent-unavailable behaviour
**"Process data as usual"**; Waiting Period blank; all four Personal Data
Handling restrictions (transfer to Zoho apps, transfer to third-party apps,
**access through API**, data in export) left **off**. That combination turns
on the GDPR tooling without changing how leads are processed — the API
restriction in particular would have broken the MCP integration.

**Verified, because a Zoho rejection is swallowed:** `submitZohoLead`
failures are caught and the visitor still gets `{"ok":true}`, so a broken
Web-to-Lead would be invisible from the form. After enabling, one clearly
marked test enquiry was POSTed to the live `/api/contact` (curl, not a
browser, to avoid firing a real Google Ads conversion). It reached Zoho
(records 16 → 17), and Cloud Logging showed **no** `Zoho CRM lead failed`
entry. The Firestore document confirmed the 3 Sep work live: `expireAt`
2028-08-23 (~24 months) and **no `ip` or `userAgent` fields**. The test lead
was then deleted from Zoho and Firestore, and both deletions re-queried to
confirm. The setting is a toggle, so it is reversible.

### 3 Sep 2026 — Zoho DPA request SENT

**Sent by Sam at 12:44 PM AEST, 3 Sep 2026** (confirmed in the Zoho Mail Sent
folder: to `"legal"<legal@zohocorp.com>`, subject "Data Processing Addendum
request - EU SCCs Module 2 + UK Addendum - Zoho CRM org biteperkau
(Australian data centre)"). This starts the clock on the one open Article 46
safeguard for the EU/UK → Australia transfer to Zoho. **When the DPA comes
back countersigned**, flip the three `TODO(legal)` sentences — `copy.ts`
(EN core, FR core) and `markets.ts` (gb-en, which is the IDTA/TRA variant and
may need its own separate evidence) — and record the date here. Until then
the notices correctly say no safeguard is signed.

Drafting notes retained for reference:

Drafted in Zoho Mail as **`biteperk@biteperk.com.au`** (an alias of the
`vocotable@biteperk.com.au` mailbox) rather than a personal address, so Zoho
can match the request to the account. Deliberately not the `.com`/`.com.au`
audience rule — that governs prospect correspondence; this is vendor account
administration and must come from the account identity. To
`legal@zohocorp.com`, requesting the DPA with **EU SCCs Module 2 + the UK
Addendum/IDTA**, naming org `biteperkau` on the Australian data centre, and
both controllers (Biteperk Pty Ltd ABN 36 700 831 303 for EEA visitors;
Biteperk Ltd 17379647 for UK visitors). **It is sitting in Drafts.** Note the
mailbox's auto-signature may have been displaced by the typed body — worth a
glance before sending.

### 3 Sep 2026 — ICO registration for Biteperk Ltd: STARTED, handed to Abhishek (issue #27)

**The register was searched first: Biteperk is NOT currently registered**, so
there is no duplicate risk and the registration is genuinely outstanding.

**Owner: Abhishek** (Sam's call, 3 Sep 2026) — tracked as
https://github.com/biteperk/biteperk-website/issues/27, which carries the full
answer table, the three judgement calls and the shifting-button trap. Post the
registration reference on that issue; it then goes into the `/gb-en` privacy
notice and here.

The form was completed up to the mandatory **Title** field on the
data-protection-contact page. That is an honorific for Sam and was not
guessed. The ICO flow must be **completed in one session and ends in card
payment**, so if the session has expired, redo it with these answers:

| Field | Value |
|---|---|
| Organisation type | Limited company / private limited company |
| Company (Companies House lookup) | `17379647, BITEPERK LTD, LONDON` — auto-fills name, number, 124 City Road, London, EC1V 2NX, United Kingdom |
| Trading names | left blank (optional) |
| Public authority? | No |
| Charity / exempt charitable status? | No |
| Small occupational pension scheme? | No |
| 10 or fewer staff? | Yes → **Tier 1, £52** (£47 by direct debit) |
| Main contact | Sam Kalaliya · Director · sales@biteperk.com · +61 2 5504 1140 · 124 City Road, London EC1V 2NX, UK |
| DPO needed? | Tracking/monitoring on a large scale: No. Large-scale special category or criminal offence data: No. → ICO confirms **no DPO required** |
| Provide a data protection contact? | Yes — "provide a contact", not a nominated DPO |
| Data protection contact | Title **← Sam to choose**, Sam Kalaliya; publish name: No; contact method: Email `sales@biteperk.com`; publish contact details: Yes |

Two judgement calls to sanity-check before paying: the telephone is the **AU**
business line (Biteperk Ltd has no UK number, and inventing a `+44` would
breach the `check-truthful` gate's rationale), and the two DPO questions were
answered No on the basis that the core activity is answering restaurant calls,
with no biometric identification and no special category data.

### 3 Sep 2026 — Review packet rendered for Natalia's bundle

`15_Website_Contact_Form_Privacy_Review_3Sep2026.docx` generated into
`3-Website-Publish-Layer/` and `5-Internal-Only/` by a new
`_build/21-contact-form-review.js`, in the pack's house style. Two traps
avoided: `refresh-natalia-bundle.sh` and `20-website-layer.js` rewrite
documents `03`–`07` by absolute path (SHA-256 hashes were taken before and
after to prove those five were untouched), and `style.js`'s exported `OUT`
constant is a dead sandbox path, so the new script derives paths from
`__dirname`. **Delivery is still Sam's**: Dropbox was not logged in, so the
file has not been placed in Natalia's shared folder.
6. ~~Ludovic's pass on the new French~~ — **done 3 Sep 2026.** Ludovic Roux
   gave a **verbal** pass on the 3 Sep privacy/cookie French (the `privacy.fr`
   core, the cookies "Strictement nécessaires" sentence, and the CNIL /
   APD-GBA sentences in `markets.ts`), confirmed by Sam. Recorded as verbal on
   purpose: unlike the 26 and 27 Jul sign-offs there is no email behind it.
   The `⚠️ DRAFT French` markers are removed and the sign-off is noted in
   `src/data/intl/copy.ts`'s header. Comment-only change — the built HTML is
   byte-identical, verified by diffing a before/after `dist-global/`, so no
   redeploy was needed.

## 5 Sep 2026 — VoxStay goes public on the site

Decision (Sam, 5 Sep 2026): **VoxStay** — Bella as a hotel receptionist,
built in `~/voxstay` since 20 Aug 2026 and running as a demo on Google Cloud
Paris — moves from *pitch-only* to a public **`in-development`** product on
every tree (`/au-en` and the five international locales), status pill and
"Join the waitlist" CTA, shipped **now** rather than after the September
hotel-platform demo. `BRAND.md` and `CLAUDE.md` previously forbade exactly
this; both were rewritten in the same PR.

What the public copy is allowed to say was fixed before a word was written:
architectural facts only (eight languages, real price with taxes, texted
secure payment link, never a card number on the call, cannot invent a price,
falls back to ringing the front desk, *designed* for EU hosting). No prospect
names, no hotel PMS/OTA names (a new **case-sensitive** `check-truthful`
entry bans D-EDGE / Apaleo / Mews / Opera PMS / Cloudbeds / Booking.com /
Expedia / SiteMinder / Guestline / RoomRaccoon — case-sensitive because
`mews` is a London street word and `Opera` is a Sydney building), no price,
no metric, no "our Paris team", no +61 test number. VoxStay is the one
exception to the AU tree's "Australian data residency" line, and the copy
says so where that line appears.

**French is DRAFT.** `src/data/intl/products.ts` (`voxstay` in both the
detail table and the overview capabilities, plus the "cinq usages" overview
title/h1 and a VoxDrive sentence) and one about-intro clause in `markets.ts`
are marked `// DRAFT French (5 Sep 2026) — needs Ludovic's pass.` Ludovic
Roux is also the hotel prospect, so **Sam sequences the review request with
the demo**. Until the pass lands, `/fr` and `/be-fr` serve draft French on
those pages by decision.

Gate found and closed on the way: `tests/unit/intl-merge.test.mjs` walks
`resolveCopy()` only, so product prose was never parity-tested — English
pasted into the French product table would have shipped. New
`tests/unit/intl-products.test.mjs` asserts slug parity with
`PRODUCT_SLUGS`, no empty leaves, no identical EN/FR leaves, h1 ≤ 45 chars
(the intl OG card has no overflow guard) and a per-product photo with a
French alt. `generate-og.mjs` now throws if a catalogue slug has no AU card.

Post-ship (Sam): Search Console inspect `/au-en/products/voxstay/` + resubmit
the sitemap; re-scrape the LinkedIn / Facebook share caches for
`products.png`; confirm "VoxStay" is in the Zoho product picklist (the Cloud
Function has accepted the slug since the Zoho integration commit).

## 6 Sep 2026 — International trust module, French consent notice, and the Ludovic batch

**Shipped (PR after `perf/intl-lcp`, branch `feat/intl-trust`).** The five
locale homes and contact pages carry a **trust module** (`TrustPanel.astro`):
the market's three trust principles as icon cards, and a facts strip — who the
visitor contracts with (Biteperk Ltd on `/gb-en`, Biteperk Pty Ltd elsewhere,
register number only, never the office address), that Bella announces herself
as an AI and hands the call to the venue's own team, where records and
live-call audio go (Google Cloud Australia; voice platform in the United
States — the same words as the privacy notice), and the lawful basis (Article
6(1)(f) GDPR; **UK GDPR** on `/gb-en` via a market override). Every value is
derived from `site.ts` `entities` or `copy.ts` `trustFacts`; none is typed on
the page.

**Deliberately absent, and now gated.** `check-truthful` gained four
`FORBIDDEN_CLAIMS` (text pass, fault-injected): EU / Paris hosting for the
restaurant products (`europe-west*`, "hosted in the EU / Paris", the French
equivalents — exempting only `/products/voxstay/`, whose single design-intent
sentence is allowed), "human oversight" / "supervision humaine" (there is no
European staff; the hand-off is to the venue), "certified" / "accredited"
(nothing is), and a named carrier next to forwarding vocabulary (BT, EE, O2,
Gamma, Vodafone, Orange, Proximus, Bouygues, SFR, Telenet — an untested
compatibility claim). The 6 Sep proposal that prompted this work had suggested
a "Google Cloud Paris for EU/UK pilots" badge and "supervision humaine
permanente"; both would have been false for VoxTable and are exactly what the
rules catch.

**Consent notice now in the tree's language.** `ConsentBanner.astro` was
hardcoded English on `/fr` and `/be-fr` — informed consent under GDPR needs a
notice the visitor can read. The strings moved to `copy.ts` `chrome.consent`
(language-scoped; the English category titles/bodies are read from
`consent.ts` so they cannot drift). `tests/intl/chrome.spec.ts` asserts the
accept button reads "Tout accepter" on the French trees.

**French written today is DRAFT — the Ludovic batch.** Everything below needs
his pass before it is treated as reviewed; until then `/fr` and `/be-fr`
serve it by decision, as with the VoxStay copy on 5 Sep. One request, sequenced
with the VoxStay demo (he is also the hotel prospect):

1. `copy.ts` `chrome.consent` (fr) — the cookie bar and settings modal.
2. `copy.ts` `trustFacts` (fr) — the facts strip: heading, four labels, three sentences, the privacy link label.
3. Still open from before: `copy.ts:214,221` footer/nav labels (29 Jul, 7 Aug), `copy.ts:933` the French city-page furniture (gates every FR city), `markets.ts` about-intro clause (5 Sep), `intl/products.ts` VoxStay overview + detail (5 Sep).
4. Coming next and to be bundled if ready: the localised call-simulation transcript (Phase 3) and the Paris / Bruxelles city copy (Phase 4).

Owner: Sam sends; record the pass here when it lands and drop the `DRAFT`
markers in the same commit.
