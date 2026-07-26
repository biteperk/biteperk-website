/**
 * Locale suggestion chip — offer, never redirect.
 *
 * Reads `navigator.languages` (nothing else — no IP lookup, no Geolocation
 * permission, nothing leaves the browser), matches it against each locale's
 * hreflang codes from locales.ts, and offers the match if it isn't the page
 * the visitor is already on.
 *
 * Auto-redirecting on language is the pattern that traps people who chose a
 * locale on purpose and hides content from crawlers. This only ever shows a
 * dismissible chip, and the dismissal sticks.
 *
 * Contract with LocaleSuggest.astro:
 *   [data-locale-suggest]        the chip (starts `hidden`)
 *   [data-locale-suggest-data]   JSON candidates, built server-side
 *   [data-ls-text|chip|label|go|dismiss]  the parts to fill
 */
(() => {
  const KEY = "bp-locale-suggest-dismissed";

  type Candidate = {
    base: string;
    home: string;
    label: string;
    lang: string;
    hreflang: string[];
    suggest: string;
    dismiss: string;
  };

  function dismissed(): boolean {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false; // private mode — just show it; dismissing still hides it for the session
    }
  }

  function init(): void {
    const el = document.querySelector<HTMLElement>("[data-locale-suggest]");
    const dataEl = document.querySelector<HTMLScriptElement>("[data-locale-suggest-data]");
    if (!el || !dataEl || el.dataset.lsBound === "1") return;
    el.dataset.lsBound = "1";

    if (dismissed()) return;

    let candidates: Candidate[] = [];
    try {
      candidates = JSON.parse(dataEl.textContent || "[]");
    } catch {
      return;
    }

    const current = el.dataset.current;
    // Browser order is preference order — first match wins, so a visitor whose
    // list is [fr-BE, fr, en] gets Belgium-French, not generic French.
    const langs = (navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language]
    )
      .filter(Boolean)
      .map((l) => l.toLowerCase());

    let match: Candidate | undefined;
    outer: for (const tag of langs) {
      for (const c of candidates) {
        if (c.hreflang.some((h) => h.toLowerCase() === tag)) {
          match = c;
          break outer;
        }
      }
    }

    // No match, or they're already where they belong (including every ccTLD
    // arrival, which lands on its own market).
    if (!match || match.base === current) return;

    const text = el.querySelector<HTMLElement>("[data-ls-text]");
    const go = el.querySelector<HTMLAnchorElement>("[data-ls-go]");
    const chip = el.querySelector<HTMLElement>("[data-ls-chip]");
    const label = el.querySelector<HTMLElement>("[data-ls-label]");
    const dismiss = el.querySelector<HTMLButtonElement>("[data-ls-dismiss]");
    if (!text || !go || !label || !dismiss) return;

    // Copy is in the target locale's language — we're addressing someone who
    // reads it — so the element carries that lang for screen readers.
    text.textContent = match.suggest;
    text.lang = match.lang;
    label.textContent = match.label;
    label.lang = match.lang;
    if (chip) chip.textContent = match.base.replace(/^\//, "").toUpperCase();
    go.href = match.home;
    go.hreflang = match.hreflang[0];
    go.lang = match.lang;
    dismiss.setAttribute("aria-label", match.dismiss);

    const hide = () => {
      el.hidden = true;
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* private mode — hidden for this page view, which is enough */
      }
    };
    dismiss.addEventListener("click", hide);
    // Taking the offer is also a decision: don't ask again.
    go.addEventListener("click", hide);

    el.hidden = false;
  }

  init();
  document.addEventListener("astro:page-load", init);
})();
