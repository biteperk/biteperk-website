/**
 * Cookie-consent + tracking config — the single source of truth.
 *
 * The website ships privacy-first: strict opt-in, nothing non-essential
 * runs until the visitor clicks Accept. Everything here is STAGED and
 * inert until an account ID is filled in — flip one field to go live.
 *
 * Go-live checklist (one edit each):
 *   - `plausibleReady = true`  ← once the Plausible site for biteperk.com.au exists
 *   - `linkedInPartnerId = "1234567"`  ← once the LinkedIn ads account exists
 *   - (optional) fill `linkedInConversions` to fire ad conversions on goals
 *
 * `TRACKING_ARMED` is derived: while it's false NOTHING is armed, so the
 * banner does not show at all (nothing to consent to). The banner
 * auto-appears the moment the first tracker is armed.
 */

/** Bump to invalidate stored choices and re-prompt everyone. */
export const CONSENT_VERSION = 1;

/** localStorage key holding the visitor's choice. Necessary, first-party. */
export const CONSENT_KEY = "bp-consent";

/** Analytics: flip true once the Plausible account is live. */
export const plausibleReady = false;

/** Marketing: LinkedIn Partner ID, e.g. "1234567". null = dormant. */
export const linkedInPartnerId: string | null = null;

/**
 * LinkedIn conversion IDs keyed by our goal name (see GOALS). Dormant
 * until both a partner ID and an entry here exist. Only the mapped goals
 * fire a conversion; the rest are Plausible-only.
 */
export const linkedInConversions: Partial<Record<GoalName, string>> = {
  // book_demo: "12345",
  // submit_contact: "12346",
};

/**
 * True when at least one tracker is armed. The banner + consent machinery
 * are dormant (not even rendered visible) until this is true, so shipping
 * before any account exists puts NO cookie notice on a tracker-free site.
 */
export const TRACKING_ARMED = plausibleReady || linkedInPartnerId !== null;

/**
 * Canonical marketing goal taxonomy. Every conversion-worthy interaction
 * maps to one of these names so Plausible Goals and LinkedIn Conversions
 * line up 1:1. The values are the `data-cta`/`bp:event` names used in
 * markup; `consent.ts`/`analytics.ts` normalise legacy names to these.
 */
export const GOALS = {
  book_demo: "book_demo",
  call_click: "call_click",
  free_trial_click: "free_trial_click",
  view_pricing: "view_pricing",
  view_platform: "view_platform",
  submit_contact: "submit_contact",
  outbound_perktable: "outbound_perktable",
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
  "form-success": "submit_contact",
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
    body: "Remembers your theme and your cookie choice so the site works and doesn't ask you twice. Stored only in your browser (localStorage) — never sent to a server, no personal data.",
  },
  {
    id: "analytics",
    title: "Analytics",
    locked: false,
    body: "Privacy-first, cookieless analytics (Plausible) that counts page visits and which links help visitors — aggregated, no cookies, no cross-site tracking, no personal profiles.",
  },
  {
    id: "marketing",
    title: "Marketing",
    locked: false,
    body: "The LinkedIn Insight Tag, so we can measure our LinkedIn ads and show relevant updates to people who've visited. This one sets third-party cookies — it only runs if you switch it on.",
  },
];
