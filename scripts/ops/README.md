# scripts/ops — operational scripts (run by hand, never in CI)

Unlike `scripts/gates` (CI) and `scripts/build` (build pipeline), these touch
LIVE production data. Read the header of each script before running it.

## Auth model

Scripts here use **Application Default Credentials** with an explicit project:

- One-time setup: `gcloud auth application-default login` (as the account with
  Firestore access). The ADC file's stored quota project belongs to ANOTHER
  project on this machine — never run `set-quota-project` here (it mutates the
  shared ADC file). Scope attribution per-run instead:
  `GOOGLE_CLOUD_QUOTA_PROJECT=vocotable node scripts/ops/<script>`.
- Scripts must pass the project explicitly (`initializeApp({ projectId:
  "vocotable" })`) — never rely on ADC's default project.
- **The leads database is the NAMED Firestore DB `biteperk-leads`**
  (australia-southeast1). `getFirestore("biteperk-leads")` — the `(default)`
  database exists and is empty, so a script that forgets this "works" and
  reads nothing.

## Scripts

- `export-ad-conversions.mjs` — Google Ads offline-conversion CSV from
  qualified (`quality: "ok"`), ad-attributed (`gclid`-carrying) leads.
  Read-only against Firestore; writes to `deliverables/ads/` (gitignored).
  See the script header for the upload procedure and the Primary/Secondary
  conversion-action strategy it exists to enable.
