# Accounts & operations log (BitePerk)

A living reference for BitePerk's email/CRM/discovery setup and the operational changes made to it. Update this when addresses, phone/NAP, connectors, or listing status change. Last updated: **2026-07-16** (added inbox management + filters + John delivery issue).

---

## Email addresses (Zoho Mail — mailbox `biteperk@biteperk.com.au`)

All addresses below are **aliases on the single Zoho mailbox** `biteperk@biteperk.com.au` — mail to any of them lands in the same inbox, and any of them can be used as a send-from address.

| Address | Display name | Purpose / when to use |
|---|---|---|
| `biteperk@biteperk.com.au` | Biteperk | Primary mailbox address (Zoho login). Back-office / account owner. |
| `hello@biteperk.com.au` | BitePerk | Public/general contact. Canonical address on the website, `site.ts`, and directory listings. Website contact-form notifications are currently **sent from** here (consider moving them to `no-reply@`). |
| `sam@biteperk.com.au` | Sam · BitePerk | **Personal / founder address. Use for warm 1:1 sales replies** (e.g. following up inbound leads). Converts better than a role inbox. |
| `vocotable@biteperk.com.au` | BitePerk · VocoTable | Product/brand address for VocoTable — put on the VocoTable product page and in campaigns so inbound interest is self-sorting. |
| `support@biteperk.com.au` | BitePerk Support | Customer support once venues are live. Route to a Support folder via a Zoho filter. |
| `accounts@biteperk.com.au` | BitePerk Accounts | Invoices, billing, payment/receipt questions. |
| `no-reply@biteperk.com.au` | BitePerk | Automated/system mail (form notifications, alerts) so those don't come from a human address. |

All of the above are **aliases created 2026-07-16** on the single mailbox `biteperk@biteperk.com.au`.

**Still recommended, not yet created:** `sales@` (or `bookings@`) for inbound commercial/demo enquiries; `privacy@` as the privacy-policy contact (good practice under the Australian Privacy Act, which the site copy references).

**Convention going forward:** warm one-to-one replies go from `sam@`; general/public contact stays `hello@`; product-page/campaign capture uses `vocotable@`; support and billing use `support@` / `accounts@`; automated mail uses `no-reply@`. House style for display names: real name for personal (`Sam · BitePerk`), `BitePerk` / `BitePerk <Function>` / `BitePerk · <Product>` for role and product addresses. As the alias list grows, set up **Zoho filters/folders** so mail to each address is auto-filed and they don't blur together in the one inbox.

---

## NAP / phone

Canonical NAP (see `docs/directory-citations.md` for the paste-ready block):

```
Biteperk · Level 1, 477 Pitt Street, Haymarket NSW 2000, Australia
Phone: +61 2 5504 1140   (display: (02) 5504 1140)
Email: hello@biteperk.com.au · Web: https://biteperk.com.au
```

- **Phone changed** from the old mobile `0450 011 140` to `+61 2 5504 1140`.
- **Google Business Profile** phone updated to `(02) 5504 1140` on 2026-07-16. ⚠️ The GBP is under the **biteperk@gmail.com** Google account (not the main login) and is **not yet verified** — the edit is saved but won't show publicly until GBP verification is completed (open launch blocker).

---

## Search Console / sitemap

- Re-submitted `https://biteperk.com.au/sitemap-index.xml` in Google Search Console (domain property `sc-domain:biteperk.com.au`) on 2026-07-16 to get the new city landing pages crawled. Note: for a domain property, submit the **full URL**, not a bare path.
- **Scheduled follow-up:** a one-time task runs **2026-07-23 09:00 AEST** to re-check crawl/index status. (Runs while the app is open, or on next launch.)

---

## Directory listings

- Status: **none submitted yet** — tracker in `docs/directory-citations.md` is all unchecked. No live citations carry the old phone, so nothing off-site needs correcting yet.
- Paste-ready field maps for all 8 Tier 1 directories are in **`docs/directory-listings-paste-ready.md`** (uses the new phone).
- ⚠️ Blockers: **ABN still `TODO`** (needed by Yellow Pages / White Pages / True Local); do **Bing Places after** GBP verification so it imports the correct number.

---

## Inbound leads — website contact form

Full extract with classification: **`BitePerk_website_enquiries_2026-07-16.xlsx`** (repo root). Read from Zoho Mail Sent → "New website enquiry" notifications on 2026-07-16.

**Genuine leads (follow up):**

| Date | Name | Venue | Product | Email | Notes |
|---|---|---|---|---|---|
| 2026-07-03 | aqila | darbar cafe | VocoTable | agha.kh7@gmail.com | "phone answering ai for taking orders and booking requests" — strong fit, ~2 wks old. Best lead. |
| 2026-05-29 | John | Jimmy on the Mall | VocoTable | john@cur.com.au | "Hey, I wanna get into this" — hot but terse, ~7 wks stale; contact ASAP. Brisbane venue. |

**Spam / cold-pitches (ignore):** two "Davidziz" chat-spam (Telegram/WhatsApp +375 Belarus), "Layne MKT" (UI/UX agency), "Alice" & "Katiyar" (SEO pitches). **Internal tests:** "Prod Test", "Smoke Test".

**Note:** 6 of 9 form submissions were junk — worth adding a keyword/link filter (`t.me`, `+375`) to the contact form on top of the existing honeypot.

**Pending action:** warm follow-up emails drafted for aqila and John (send from `sam@`), not yet sent.

---

## Inbox management (Zoho Mail)

Cleaned up and organised on 2026-07-16:

- **"Leads" folder created** — holds the genuine website enquiries. Currently: **aqila** (darbar cafe) and **John** (Jimmy on the Mall). File future real enquiries here.
- **Inbox cleared** — ~28 junk items (Zoho account/alias notifications, sign-in alerts, Site24x7 marketing, welcome email, and the spam/test enquiry copies) moved to Trash. Sent folder untouched (full copies retained).
- **Two auto-filters** now keep the inbox clean going forward:
  - *Zoho account notifications* — from `zohoaccounts.com.au` OR subject contains "email address" → auto-files to the **Notification** folder (kept, not deleted, so sign-in security alerts remain retrievable).
  - *Site24x7 marketing* — from `site24x7` → **Trash**.

### ⚠️ John lead — email delivery failing
The follow-up sent from `sam@` to **john@cur.com.au** (2026-07-16) has **not been delivered**: receiving server unreachable (SMTP 421, "Host not reachable"), Zoho retrying for ~4 days. Temporary delay, not a hard bounce — may still land. If it hard-bounces, the address/domain (`cur.com.au`) is the problem; reach John another way or call. aqila's email delivered fine.

## Zoho CRM connector — ⚠️ known issue

- The Zoho CRM MCP connector is authorized to the **wrong organization**: trial org **7007128107** (owner `algorythmos.france`), *not* BitePerk's real CRM at **`crm.zoho.eu`, org 20116759965**.
- 5 leads created via the connector on 2026-07-15 landed in that trial org and were **deleted** to keep it clean. They were **not** added to the real CRM.
- **To fix:** reconnect the Zoho CRM connector to the `.eu` account for org 20116759965, then re-create the leads there (merging the existing "Anonymous / El corte", "Anonymous / Lavazza", and "Manager / Great Southern" records in place rather than duplicating).
- Note: Zoho **CRM** does not render in an automated browser tab; the API/connector is the working path. Zoho **Mail** does render fine in automation.

---

## Rollback reference (site)

`firebase hosting:rollback` reverts the hosting deploy instantly (functions untouched). Noted for reference only — not run.
