/**
 * Analytics bridge for self-hosted Umami.
 *
 * The tracker itself is a <script defer src=".../script.js"> in the <head>
 * (see src/layouts/Base.astro). Umami auto-records pageviews — including
 * Astro ClientRouter soft navigations, which it catches via its history
 * pushState/replaceState hooks — so this module does NOT send pageviews.
 *
 * It does two things:
 *
 *  1. GOALS — turns the site's existing signals into Umami events:
 *       • clicks on any [data-cta] element (value = goal name)
 *       • document.dispatchEvent(new CustomEvent("bp:event",
 *         { detail: { name: "form-success" } }))  ← the contact-form success
 *         block on both trees already fires this, so a confirmed submission
 *         becomes the `contact_form_submitted` event with no page-level edit.
 *     Legacy names are normalised to the canonical taxonomy (GOAL_ALIASES).
 *
 *  2. OPT-OUT — analytics is cookieless and exempt, so it runs by default, but
 *     the consent banner's Analytics toggle must still switch it off. Umami's
 *     own kill-switch is localStorage["umami.disabled"]. The authoritative
 *     first write happens PRE-PAINT in Base.astro (before Umami's deferred
 *     script runs, so an opted-out returning visitor leaks no pageview); this
 *     module keeps it in sync when the choice changes at runtime.
 */
import { CONSENT_KEY, CONSENT_VERSION, GOAL_ALIASES } from "@/data/consent";

const UMAMI_DISABLED_KEY = "umami.disabled";

function normalise(name: string): string {
  return GOAL_ALIASES[name] ?? name;
}

/** Fire a named goal, if the tracker is present and not disabled. */
function track(name: string): void {
  try {
    window.umami?.track(normalise(name));
  } catch {
    /* analytics must never break the page */
  }
}

/**
 * Mirror the stored analytics choice onto Umami's kill-switch.
 * Explicit opt-out (analytics === false) disables; anything else leaves it on
 * (the exempt default). Same read as the pre-paint script in Base.astro.
 */
function syncOptOut(): void {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    let optedOut = false;
    if (raw) {
      const c = JSON.parse(raw);
      optedOut = !!c && c.v === CONSENT_VERSION && c.analytics === false;
    }
    if (optedOut) localStorage.setItem(UMAMI_DISABLED_KEY, "1");
    else localStorage.removeItem(UMAMI_DISABLED_KEY);
  } catch {
    /* private-mode storage can throw; the pre-paint default already applied */
  }
}

syncOptOut();

document.addEventListener("click", (e) => {
  const el = (e.target as Element | null)?.closest?.("[data-cta]");
  if (el instanceof HTMLElement && el.dataset.cta) track(el.dataset.cta);
});

document.addEventListener("bp:event", (e) => {
  const name = (e as CustomEvent<{ name?: string }>).detail?.name;
  if (name) track(name);
});

// Consent changed at runtime (banner/settings): re-apply the kill-switch.
document.addEventListener("bp:consent-change", syncOptOut);
