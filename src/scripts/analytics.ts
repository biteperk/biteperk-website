/**
 * First-party analytics client (Plausible event format, ~1KB).
 *
 * Sends pageviews + named goals same-origin to /api/event, which a
 * Cloud Function forwards to Plausible — no third-party request, CSP
 * stays connect-src 'self', no cookies, no personal data.
 *
 * CONSENT: strict opt-in. Nothing is sent until the visitor grants the
 * Analytics category (see src/scripts/consent.ts). We listen for the
 * `bp:consent-change` event and read the stored choice on load; until
 * `analytics === true` every send() is a no-op.
 *
 * Goals fire from:
 *   - clicks on any element with [data-cta] (value = goal name)
 *   - `document.dispatchEvent(new CustomEvent("bp:event", { detail:
 *     { name: "form-success" } }))` for programmatic moments
 * Legacy names are normalised to the canonical taxonomy (GOAL_ALIASES).
 *
 * READY: `plausibleReady` in src/data/consent.ts — flip true once the
 * Plausible site for biteperk.com.au exists.
 */
import { plausibleReady, CONSENT_KEY, CONSENT_VERSION, GOAL_ALIASES } from "@/data/consent";

// Canonical host after the single-domain migration (rev.3). biteperk.com.au
// now 301-redirects to biteperk.com/au-en, so visitors are on biteperk.com in
// practice; the legacy host stays in the allowlist for the redirect window.
// NOTE: the Plausible site id (`d` below) must match this value in the
// Plausible dashboard — set the site up as "biteperk.com".
const DOMAIN = "biteperk.com";

function onSite(): boolean {
  const h = window.location.hostname;
  return (
    h === DOMAIN ||
    h === `www.${DOMAIN}` ||
    h === "biteperk.com.au" ||
    h === "www.biteperk.com.au"
  );
}

/** Read the analytics-consent flag straight from storage (authoritative). */
function analyticsConsented(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const c = JSON.parse(raw);
    return !!c && c.v === CONSENT_VERSION && c.analytics === true;
  } catch {
    return false;
  }
}

let analyticsOk = analyticsConsented();

function normalise(name: string): string {
  return GOAL_ALIASES[name] ?? name;
}

function send(name: string, props?: Record<string, string>): void {
  if (!plausibleReady || !analyticsOk || !onSite()) return;
  try {
    const body = JSON.stringify({
      n: normalise(name),
      u: window.location.href,
      d: DOMAIN,
      r: document.referrer || null,
      ...(props ? { p: props } : {}),
    });
    if (!navigator.sendBeacon?.("/api/event", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* analytics must never break the page */
  }
}

let lastUrl = "";
function pageview(): void {
  if (window.location.href === lastUrl) return;
  lastUrl = window.location.href;
  send("pageview");
}

document.addEventListener("click", (e) => {
  const el = (e.target as Element | null)?.closest?.("[data-cta]");
  if (el instanceof HTMLElement && el.dataset.cta) send(el.dataset.cta);
});

document.addEventListener("bp:event", (e) => {
  const name = (e as CustomEvent<{ name?: string }>).detail?.name;
  if (name) send(name);
});

// React to consent: on grant, register the current page so the first
// accepted view isn't lost; on withdrawal, silently stop sending.
document.addEventListener("bp:consent-change", (e) => {
  const granted = (e as CustomEvent<{ analytics?: boolean }>).detail?.analytics === true;
  const wasOff = !analyticsOk;
  analyticsOk = granted;
  if (granted && wasOff) {
    lastUrl = "";
    pageview();
  }
});

// Fires on initial load and after every View Transition navigation.
document.addEventListener("astro:page-load", pageview);
pageview();
