/**
 * First-party analytics client (Plausible event format, ~1KB).
 *
 * Sends pageviews + named goals same-origin to /api/event, which a
 * Cloud Function forwards to Plausible — no third-party request, CSP
 * stays connect-src 'self', no cookies, no personal data.
 *
 * Goals fire from:
 *   - clicks on any element with [data-cta] (the attribute value is the
 *     goal name, e.g. data-cta="book-demo")
 *   - `document.dispatchEvent(new CustomEvent("bp:event", { detail:
 *     { name: "form-success" } }))` for programmatic moments
 *
 * READY flag: flip to true once the Plausible site for biteperk.com.au
 * exists (account + domain registered). Until then this module sends
 * nothing at all.
 */

const READY = false; // ← flip to true when the Plausible account is live
const DOMAIN = "biteperk.com.au";

function onSite(): boolean {
  const h = window.location.hostname;
  return h === DOMAIN || h === `www.${DOMAIN}`;
}

function send(name: string, props?: Record<string, string>): void {
  if (!READY || !onSite()) return;
  try {
    const body = JSON.stringify({
      n: name,
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

// Fires on initial load and after every View Transition navigation.
document.addEventListener("astro:page-load", pageview);
pageview();
