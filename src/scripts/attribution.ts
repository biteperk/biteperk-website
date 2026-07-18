/**
 * First-touch lead attribution (first-party, no consent needed).
 *
 * Captures campaign params + referrer on the first page of a session and
 * stashes them in sessionStorage. The contact form (contact.astro) reads
 * them into hidden fields, so each enquiry the visitor CHOOSES to send
 * records which campaign produced it — letting us measure ad → demo.
 *
 * This sets no cookies, sends nothing on its own, and only travels with a
 * form the user submits, so it's part of the enquiry they intend to send
 * (not tracking) — it runs regardless of cookie consent.
 */
export {}; // ES module scope — keeps these consts out of the global script scope

const KEY = "bp-attr";
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "li_fat_id"];

function capture(): void {
  try {
    if (sessionStorage.getItem(KEY)) return; // first-touch wins
    const params = new URLSearchParams(location.search);
    const attr: Record<string, string> = {};
    for (const f of FIELDS) {
      const v = params.get(f);
      if (v) attr[f] = v.slice(0, 200);
    }
    // Only persist when there's a real campaign signal (or an external
    // referrer worth keeping) — avoids storing an empty blob for direct hits.
    const ref = document.referrer && !document.referrer.includes(location.hostname)
      ? document.referrer.slice(0, 300)
      : "";
    if (Object.keys(attr).length === 0 && !ref) return;
    if (ref) attr.referrer = ref;
    attr.landing = location.pathname.slice(0, 200);
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    /* private mode / no storage — attribution is best-effort */
  }
}

capture();
