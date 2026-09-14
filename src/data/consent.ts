/**
 * Cookie-consent + tracking config — the single source of truth.
 *
 * The website ships privacy-first. Analytics is self-hosted Umami: cookieless,
 * no cross-site tracking, no personal profiles, IP addresses hashed and not
 * stored. It qualifies for the CNIL/ICO audience-measurement exemption, so it
 * loads for every visitor by default and is NOT gated behind consent — the
 * Analytics category is an OPT-OUT (honoured via Umami's own `umami.disabled`
 * localStorage switch; see src/scripts/analytics.ts). Google Ads uses advanced
 * consent mode; all marketing trackers remain opt-in.
 *
 * Go-live checklist (one edit each):
 *   - `UMAMI_SITES.production.websiteId`  ← the Umami website id (already set)
 *   - `googleAdsId = "AW-..."`  ← once the Google Ads account exists
 *   - `linkedInPartnerId = "1234567"`  ← once the LinkedIn ads account exists
 *   - (optional) fill platform conversion maps to fire ad conversions on goals
 *
 * `TRACKING_ARMED` is derived from the MARKETING trackers only: while it's
 * false NOTHING is armed that needs consent, so the banner does not show at
 * all. Analytics never arms it (exempt, opt-out). The banner auto-appears the
 * moment the first marketing tracker is armed.
 */

/** Bump to invalidate stored choices and re-prompt everyone. */
export const CONSENT_VERSION = 3;

/** Display date for the privacy/cookie disclosures changed with this version. */
export const CONSENT_POLICY_LAST_UPDATED = "2026-08-28";

/** localStorage key holding the visitor's choice. Necessary, first-party. */
export const CONSENT_KEY = "bp-consent";

/**
 * Analytics — self-hosted Umami (Postgres + Valkey) on Railway.
 *
 * `UMAMI_ENV` selects which Umami website receives the data so staging never
 * pollutes production. It is read at BUILD time from the environment (guarded
 * `globalThis.process` — undefined in the browser, where these values are
 * never consumed) and parsed strictly, exactly like INTL_LAUNCHED:
 *   - unset            → "production" (the safe default: CI and prod builds)
 *   - "staging"        → the staging website (deploy-staging.yml sets this)
 *   - "production"     → the production website
 *   - anything else    → throws, so a typo can't silently ship prod ids to
 *                        staging (or vice-versa).
 *
 * `data-domains` (ANALYTICS_HOSTS) also makes the tracker a no-op anywhere off
 * the intended host — localhost, 127.0.0.1 (Playwright) and the wrong Firebase
 * origin — so tests never send and staging never counts as production.
 *
 * To move to stats.biteperk.com later: change UMAMI_HOST here and the two CSP
 * hosts in firebase.json (biteperk-global block), then re-run
 * scripts/build/sync-staging-hosting.mjs. Nothing else changes.
 */
export const UMAMI_HOST = "https://umami-production-0b8d2.up.railway.app";
export const UMAMI_SCRIPT_URL = `${UMAMI_HOST}/script.js`;

const UMAMI_SITES = {
  production: {
    websiteId: "471c7ab9-3f85-40c8-8064-8b24339a0201",
    hosts: ["biteperk.com"] as const,
  },
  staging: {
    websiteId: "413bd928-5ae5-4250-9435-894741b178aa",
    hosts: ["biteperk-staging.web.app"] as const,
  },
} as const;

export type UmamiEnv = keyof typeof UMAMI_SITES;

function parseUmamiEnv(raw: string | undefined): UmamiEnv {
  if (raw === undefined || raw === "") return "production";
  const v = raw.trim().toLowerCase();
  if (v === "production" || v === "staging") return v;
  throw new Error(
    `UMAMI_ENV=${JSON.stringify(raw)} is not valid. ` +
      `Use "production" or "staging", or leave it unset for the default (production).`,
  );
}

export const UMAMI_ENV: UmamiEnv = parseUmamiEnv(
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.UMAMI_ENV,
);

/** The Umami website id that receives this build's data. */
export const UMAMI_WEBSITE_ID: string = UMAMI_SITES[UMAMI_ENV].websiteId;

/** Hosts the tracker will report for (`data-domains`); everything else is a no-op. */
export const ANALYTICS_HOSTS: readonly string[] = UMAMI_SITES[UMAMI_ENV].hosts;

/** True once a real Umami website id is configured. Gates the head tag. */
export const analyticsReady: boolean = /^[0-9a-f-]{36}$/.test(UMAMI_WEBSITE_ID);

/** Marketing: LinkedIn Partner ID, e.g. "1234567". null = dormant. */
export const linkedInPartnerId: string | null = null;

/**
 * Marketing: Google Ads tag ID. null = dormant.
 *
 * DISABLED 8 Sep 2026 — deliberately null. `AW-18397306929` belonged to an
 * OLD/foreign Ads account, not BitePerk's real account (142-390-3850, under
 * biteperk@gmail.com, created 8 Sep). That account is run OFFLINE-ONLY: the
 * only conversion is the "Qualified lead (offline)" click-import, fed by
 * scripts/ops/export-ad-conversions.mjs from qualified, gclid-carrying leads.
 * There is intentionally no web conversion pixel — a pixel fires for spam too,
 * which is what wasted the earlier spend. The site still CAPTURES gclid/utm
 * (the `attribution` hidden field, independent of this tag) so the offline
 * export keeps working. To re-enable a web pixel, set this to the NEW account's
 * AW id and replace the two conversion labels below with that account's labels.
 */
export const googleAdsId: string | null = null;

/** Google Ads conversion destination for a confirmed AU demo-form submission. */
export const googleAdsDemoContactConversionId: string | null = googleAdsId
  ? `${googleAdsId}/m_x8COqW9OYcELHAwsRE`
  : null;

/** Google Ads conversion destination for a confirmed /en contact submission. */
export const googleAdsGlobalDemoContactConversionId: string | null = googleAdsId
  ? `${googleAdsId}/bn2iCLeH5-YcELHAwsRE`
  : null;

/**
 * LinkedIn conversion IDs keyed by our goal name (see GOALS). Dormant
 * until both a partner ID and an entry here exist. Only the mapped goals
 * fire a conversion; the rest are Umami-only.
 */
export const linkedInConversions: Partial<Record<GoalName, string>> = {
  // book_demo: "12345",
  // contact_form_submitted: "12346",
};

/**
 * True when at least one tracker is armed. The banner + consent machinery
 * are dormant (not even rendered visible) until this is true, so shipping
 * before any account exists puts NO cookie notice on a tracker-free site.
 */
export const TRACKING_ARMED = linkedInPartnerId !== null || googleAdsId !== null;

/**
 * Canonical goal taxonomy. Every conversion-worthy interaction maps to one of
 * these names so Umami Events and LinkedIn Conversions line up 1:1. The values
 * are the `data-cta`/`bp:event` names used in markup; `consent.ts`/
 * `analytics.ts` normalise legacy names to these.
 */
export const GOALS = {
  book_demo: "book_demo",
  call_click: "call_click",
  free_trial_click: "free_trial_click",
  view_pricing: "view_pricing",
  view_platform: "view_platform",
  contact_form_submitted: "contact_form_submitted",
  outbound_voxtable: "outbound_voxtable",
  audio_demo: "audio_demo",
} as const;
export type GoalName = keyof typeof GOALS;

/**
 * Legacy `data-cta`/event names already in the markup → canonical goal.
 * Anything not listed passes through unchanged.
 */
export const GOAL_ALIASES: Record<string, GoalName> = {
  "book-demo": "book_demo",
  "call-nav": "call_click",
  "platform-trial": "free_trial_click",
  "audio-demo": "audio_demo",
  "form-success": "contact_form_submitted",
};

export type ConsentCategory = "analytics" | "marketing";

export interface StoredConsent {
  v: number;
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

/** Copy for the settings modal AND the /legal/cookies/ page (one source). */
export const categories: ReadonlyArray<{
  id: "necessary" | ConsentCategory;
  title: string;
  locked: boolean;
  body: string;
}> = [
  {
    id: "necessary",
    title: "Strictly necessary",
    locked: true,
    // Keep identical in substance to the "Strictly necessary" section of the
    // cookie policy (src/data/intl/copy.ts, src/pages/legal/cookies.astro) —
    // the settings panel and the policy must never describe different things.
    body: "Remembers your theme and cookie choice in your browser. Nothing else: the contact form uses no CAPTCHA and sets nothing on your device.",
  },
  {
    id: "analytics",
    title: "Analytics",
    locked: false,
    body: "Privacy-first, cookieless analytics (self-hosted Umami) that counts page visits and which links help visitors — aggregated, no cookies, no cross-site tracking, no personal profiles, IP addresses hashed and never stored. It needs no consent under audience-measurement rules, so it is on by default; switch it off here and it stops immediately.",
  },
  {
    id: "marketing",
    title: "Marketing",
    locked: false,
    body: "Google Ads uses consent mode to send limited cookieless measurement signals while consent is denied. Ad storage, advertising user-data use, personalisation and the LinkedIn Insight Tag stay off unless you switch Marketing on.",
  },
];
