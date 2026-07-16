# Contact form contract (v1 baseline — functions/index.js, do not change in v2)

- Endpoint: same-origin `POST /api/contact` (Firebase Hosting rewrite → `contactForm`, australia-southeast1).
- Body: JSON or form-encoded object with fields:
  - `name` (required, ≤200 chars)
  - `email` (required, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`, ≤320)
  - `message` (required, ≤5000)
  - `venue` (optional, ≤200)
  - `product` (optional, must be in `{vocotable, vocoorder, vococoncierge, vocodrive, general, ""}` else coerced to "")
  - `_gotcha` honeypot — non-empty ⇒ fake 200 success, nothing written.
- Origin allowlist: `https://biteperk.com.au`, `https://www.biteperk.com.au`; missing Origin allowed (native no-JS submits/curl).
- Response negotiation via `Accept` header:
  - `Accept: application/json` ⇒ `{ok:true}` / `{ok:false, error}` (200/400/403/405/500).
  - otherwise ⇒ self-contained branded HTML thank-you/error page (used by native no-JS form POST).
- Firestore `biteperk-leads` / `contactSubmissions` is source of truth; Zoho email is best-effort.
- Implication for v2: contact form CAN be a native `<form method="post" action="/api/contact">` with JS enhancement (fetch + JSON Accept header). Keep exact field names and honeypot name.
