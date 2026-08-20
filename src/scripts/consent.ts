/**
 * Cookie-consent engine — store, banner, settings modal, tracking gates.
 *
 * Strict opt-in: nothing non-essential runs until the visitor Accepts.
 * State lives in localStorage (`bp-consent`) + `html[data-consent]`, NOT
 * component memory, so it survives Astro View Transitions and multiple
 * tabs. Every consumer (analytics.ts, the LinkedIn loader) listens for
 * the `bp:consent-change` event rather than importing state.
 *
 * Markup contract — see ConsentBanner.astro:
 *   [data-consent-bar]        the bottom bar (role=region)
 *   [data-consent-accept|reject|settings]   bar buttons
 *   [data-consent-modal]      the settings dialog (role=dialog)
 *   [data-consent-backdrop|close|save]      modal controls
 *   input[data-consent-toggle="analytics|marketing"]   category switches
 *   [data-consent-saved]      "Preferences saved" confirmation
 *   [data-cookie-settings]    footer re-open control (anywhere on the page)
 */
import {
  CONSENT_KEY,
  CONSENT_VERSION,
  TRACKING_ARMED,
  googleAdsId,
  linkedInPartnerId,
  type StoredConsent,
} from "@/data/consent";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), textarea, select';

/* ── Store ──────────────────────────────────────────────────────────── */

function read(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as StoredConsent;
    if (!c || typeof c !== "object" || c.v !== CONSENT_VERSION) return null;
    return {
      v: c.v,
      analytics: c.analytics === true,
      marketing: c.marketing === true,
      ts: typeof c.ts === "number" ? c.ts : 0,
    };
  } catch {
    return null;
  }
}

function write(analytics: boolean, marketing: boolean): void {
  const stored: StoredConsent = { v: CONSENT_VERSION, analytics, marketing, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  } catch {
    /* private mode / storage full — consent simply won't persist */
  }
  document.documentElement.dataset.consent = "set";
  document.dispatchEvent(
    new CustomEvent("bp:consent-change", { detail: { analytics, marketing } })
  );
}

/** Preview the banner on a live-but-dormant site: ?cookie-preview=1 */
function previewForced(): boolean {
  try {
    return new URLSearchParams(location.search).get("cookie-preview") === "1";
  } catch {
    return false;
  }
}

/** Whether the banner should be shown now (no stored, valid choice yet). */
function needsChoice(): boolean {
  if (!TRACKING_ARMED && !previewForced()) return false;
  return read() === null;
}

/* ── Marketing (LinkedIn Insight Tag) ───────────────────────────────── */

let marketingLoaded = false;
let googleAdsLoaded = false;

type Gtag = (...args: unknown[]) => void;

function ensureGtag(): Gtag {
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: Gtag;
  };

  w.dataLayer ||= [];
  w.gtag ||= function gtag(...args: unknown[]) {
    w.dataLayer?.push(args);
  };

  return w.gtag;
}

function loadGoogleAds(): void {
  if (googleAdsId == null || googleAdsLoaded) return;
  googleAdsLoaded = true;

  const gtag = ensureGtag();
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  gtag("js", new Date());

  const s = document.createElement("script");
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAdsId)}`;
  s.async = true;
  document.head.appendChild(s);
}

function loadLinkedIn(): void {
  if (linkedInPartnerId == null || marketingLoaded) return;
  marketingLoaded = true;
  const w = window as unknown as {
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
  };
  w._linkedin_partner_id = linkedInPartnerId;
  (w._linkedin_data_partner_ids ||= []).push(linkedInPartnerId);
  const s = document.createElement("script");
  s.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.async = true;
  document.head.appendChild(s);
}

/** Best-effort removal of first-party LinkedIn cookies we can reach.
 *  Cross-origin cookies on licdn.com / linkedin.com are out of our reach —
 *  disclosed in the Cookie Policy. */
function clearMarketingCookies(): void {
  const names = [
    "_gcl_au",
    "_gcl_aw",
    "_gcl_dc",
    "_gcl_gb",
    "_gac",
    "li_gc",
    "lidc",
    "bcookie",
    "bscookie",
    "UserMatchHistory",
    "AnalyticsSyncHistory",
  ];
  const host = location.hostname;
  const domains = [host, "." + host, ".biteperk.com.au"];
  for (const n of names) {
    for (const d of domains) {
      document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
    }
  }
}

function updateGoogleAdsConsent(marketing: boolean): void {
  if (googleAdsId == null) return;
  if (marketing) loadGoogleAds();
  const gtag = ensureGtag();
  gtag("consent", "update", {
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });
  if (marketing) gtag("config", googleAdsId);
}

/** Apply the current stored choice to the marketing tag. */
function applyMarketing(marketing: boolean): void {
  updateGoogleAdsConsent(marketing);
  if (marketing) loadLinkedIn();
  else if (marketingLoaded) clearMarketingCookies();
}

/* ── Decisions ──────────────────────────────────────────────────────── */

function decide(analytics: boolean, marketing: boolean): void {
  write(analytics, marketing);
  applyMarketing(marketing);
  // Record the opt-in so accept-rate is visible in analytics. Only fires
  // when analytics was granted (consent gates it) — rejections aren't
  // tracked, by design. Runs after write() so the flag is already on.
  if (analytics) {
    document.dispatchEvent(new CustomEvent("bp:event", { detail: { name: "consent_accept" } }));
  }
  hideBar();
  closeModal();
}

const accept = () => decide(true, true);
const reject = () => decide(false, false);
const saveCustom = () => {
  const a = document.querySelector<HTMLInputElement>('[data-consent-toggle="analytics"]');
  const m = document.querySelector<HTMLInputElement>('[data-consent-toggle="marketing"]');
  decide(!!a?.checked, !!m?.checked);
  flashSaved();
};

/* ── Bar ────────────────────────────────────────────────────────────── */

function bar(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-consent-bar]");
}

function showBar(): void {
  const el = bar();
  if (!el) return;
  el.hidden = false;
  // Trigger the one-time slide-in on first show only.
  void el.offsetWidth;
  el.classList.add("is-in");
}

function hideBar(): void {
  const el = bar();
  if (!el) return;
  el.classList.remove("is-in");
  el.hidden = true;
}

/* ── Settings modal (focus-trapped, mirrors mobile-menu.ts) ─────────── */

let lastFocused: HTMLElement | null = null;

function modal(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-consent-modal]");
}

function focusables(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null
  );
}

function syncToggles(): void {
  const c = read();
  const a = document.querySelector<HTMLInputElement>('[data-consent-toggle="analytics"]');
  const m = document.querySelector<HTMLInputElement>('[data-consent-toggle="marketing"]');
  if (a) a.checked = c?.analytics ?? false;
  if (m) m.checked = c?.marketing ?? false;
}

function openModal(): void {
  const panel = modal();
  if (!panel) return;
  lastFocused = document.activeElement as HTMLElement | null;
  syncToggles();
  panel.hidden = false;
  void panel.offsetWidth;
  panel.classList.add("is-open");
  document.body.classList.add("no-scroll");
  focusables(panel)[0]?.focus();
}

function closeModal(): void {
  const panel = modal();
  if (!panel || panel.hidden) return;
  panel.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  const onEnd = () => {
    panel.hidden = true;
    panel.removeEventListener("transitionend", onEnd);
  };
  panel.addEventListener("transitionend", onEnd);
  window.setTimeout(() => {
    if (!panel.classList.contains("is-open")) panel.hidden = true;
  }, 350);
  lastFocused?.focus();
}

function flashSaved(): void {
  const el = document.querySelector<HTMLElement>("[data-consent-saved]");
  if (!el) return;
  el.classList.add("is-shown");
  window.setTimeout(() => el.classList.remove("is-shown"), 2000);
}

/* ── Event wiring ───────────────────────────────────────────────────── */

function onClick(e: MouseEvent): void {
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (t.closest("[data-consent-accept]")) return accept();
  if (t.closest("[data-consent-reject]")) return reject();
  if (t.closest("[data-consent-save]")) return saveCustom();
  if (t.closest("[data-consent-settings]") || t.closest("[data-cookie-settings]")) {
    e.preventDefault();
    return openModal();
  }
  if (t.closest("[data-consent-close]")) return closeModal();
  if (t.dataset.consentBackdrop !== undefined) return closeModal();
}

function onKey(e: KeyboardEvent): void {
  const panel = modal();
  if (!panel || panel.hidden) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
    return;
  }
  if (e.key !== "Tab") return;
  const items = focusables(panel);
  if (!items.length) return;
  // Fully manage Tab inside the dialog rather than relying on native
  // order — some browsers (WebKit with Full Keyboard Access off) skip
  // buttons and drop focus to <body>, which no boundary check can catch.
  e.preventDefault();
  const active = document.activeElement as HTMLElement | null;
  let idx = active ? items.indexOf(active) : -1;
  if (idx === -1) idx = e.shiftKey ? 0 : -1;
  const next = e.shiftKey
    ? (idx - 1 + items.length) % items.length
    : (idx + 1) % items.length;
  items[next].focus();
}

/** Keep focus inside an open modal even if a pointer interaction (WebKit
 *  doesn't focus controls on click) or a browser that skips buttons in the
 *  Tab order lets it escape. Guarded on `is-open` so closeModal()'s
 *  focus-return isn't yanked back. */
function onFocusIn(e: FocusEvent): void {
  const panel = modal();
  if (!panel || !panel.classList.contains("is-open")) return;
  const t = e.target as Node | null;
  if (t && !panel.contains(t)) focusables(panel)[0]?.focus();
}

/** Sync across tabs: a choice made elsewhere hides the bar here. */
function onStorage(e: StorageEvent): void {
  if (e.key !== CONSENT_KEY) return;
  const c = read();
  if (c) {
    hideBar();
    applyMarketing(c.marketing);
  } else if (needsChoice()) {
    showBar();
  }
}

/* ── Init ───────────────────────────────────────────────────────────── */

function init(): void {
  // Preview the banner on a live-but-dormant (or any) site via ?cookie-preview=1.
  if (previewForced()) document.documentElement.classList.add("consent-preview");

  // Apply any already-stored marketing choice on load (e.g. returning
  // visitor who previously accepted marketing).
  const stored = read();
  if (stored) applyMarketing(stored.marketing);

  // Show the banner if a valid choice is still needed. The pre-paint inline
  // reader may have set data-consent="set" from an older-version blob; the
  // version check in read() is authoritative, so re-open if stale.
  if (needsChoice()) {
    document.documentElement.dataset.consent = "unset";
    showBar();
  }
}

document.addEventListener("click", onClick);
document.addEventListener("keydown", onKey);
document.addEventListener("focusin", onFocusIn);
window.addEventListener("storage", onStorage);
document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-swap", () => {
  document.body.classList.remove("no-scroll");
});
init();
