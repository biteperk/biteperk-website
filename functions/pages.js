/**
 * Audience-aware bits of the contact function that have no Firebase
 * dependency, split out so tests/unit/contact-function-contract.test.mjs can
 * EXECUTE them (index.js initialises firebase-admin at load and cannot be
 * imported there).
 *
 * Two audiences, decided by the tree the form was served from:
 *   "au"     — biteperk.com/au-en. AU mailbox, AU back-link, en-AU.
 *   "global" — the five international trees (crmForm "zoho-global"). The
 *              international sales mailbox on @biteperk.com, a back-link to
 *              the visitor's OWN tree, and never an AU fact: until 13 Sep 2026
 *              a French visitor whose submit fell back to no-JS landed on an
 *              en-AU page that said "Back to biteperk.com.au" and offered the
 *              Australian address. check-truthful sweeps built pages for
 *              exactly those leaks and structurally cannot see a function
 *              response — the unit test is what covers this file.
 */

const ORIGIN = "https://biteperk.com";

/**
 * Locale bases a lead may claim. Keep in sync with src/data/locales.ts —
 * the contract test asserts this set equals the published bases there, so a
 * new locale that forgets this list fails gates:global rather than silently
 * storing leads with no market.
 */
const LOCALE_BASES = ["/au-en", "/en", "/gb-en", "/fr", "/be-en", "/be-fr"];

/** Zoho CRM's standard "Country" lead field, by tree. /en is the x-default and claims none. */
const COUNTRY_BY_LOCALE = {
  "/au-en": "Australia",
  "/gb-en": "United Kingdom",
  "/fr": "France",
  "/be-en": "Belgium",
  "/be-fr": "Belgium",
};

const MAILBOX = {
  au: "hello@biteperk.com.au",
  global: "sales@biteperk.com",
};

function audienceOf({ crmForm, locale }) {
  if (crmForm === "zoho-global") return "global";
  if (locale && locale !== "/au-en" && LOCALE_BASES.includes(locale)) return "global";
  return "au";
}

function mailboxFor(audience) {
  return MAILBOX[audience === "global" ? "global" : "au"];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/** Where "Back to the site" goes: the visitor's own tree, never another market's. */
function homeFor({ audience, locale }) {
  const base = LOCALE_BASES.includes(locale) ? locale : audience === "global" ? "/en" : "/au-en";
  return `${ORIGIN}${base}/`;
}

function page({ title, heading, body, audience, locale }) {
  const home = homeFor({ audience, locale });
  const lang = audience === "global" ? (locale === "/fr" || locale === "/be-fr" ? "fr" : "en") : "en-AU";
  const back = audience === "global" ? "Back to biteperk.com →" : "Back to biteperk.com.au →";
  // Self-contained, inline styles only (no inline <script>) so it stays clean
  // under the site CSP. Reached only when JavaScript is disabled.
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(title)} · BitePerk</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #0A0B0D; color: #E7EAEE;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 24px;
  }
  .card {
    max-width: 520px; width: 100%; text-align: center;
    padding: 40px 32px; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; background: #121317;
    box-shadow: 0 30px 80px -30px rgba(0,0,0,0.7);
  }
  .brand { font-weight: 800; letter-spacing: -0.02em; font-size: 20px; margin-bottom: 24px; }
  .brand span { color: #F5C418; }
  h1 { font-size: clamp(24px, 4vw, 32px); margin: 0 0 12px; letter-spacing: -0.02em; color: #fff; }
  p { margin: 0 0 24px; color: #9AA3AD; line-height: 1.6; }
  a.btn {
    display: inline-block; text-decoration: none; font-weight: 700;
    background: #F5C418; color: #0A0B0D; padding: 13px 22px; border-radius: 999px;
  }
</style>
</head>
<body>
  <main class="card">
    <div class="brand">bite<span>perk</span></div>
    <h1>${escapeHtml(heading)}</h1>
    <p>${body}</p>
    <a class="btn" href="${home}">${back}</a>
  </main>
</body>
</html>`;
}

function thankYouHtml({ audience, locale }) {
  return page({
    title: "Message sent",
    heading: "Thanks — we'll be in touch.",
    body:
      audience === "global"
        ? "Your request has reached the BitePerk team. We reply within a business day."
        : "Your message has reached the BitePerk team. We usually reply within a few hours during business hours (Mon–Fri, 9am–5pm AEST).",
    audience,
    locale,
  });
}

function errorHtml({ error, audience, locale }) {
  const mailbox = mailboxFor(audience);
  return page({
    title: "Something went wrong",
    heading: "That didn't go through.",
    body: `${escapeHtml(error || "Please try again.")} You can also email us directly at <a style="color:#F5C418" href="mailto:${mailbox}">${mailbox}</a>.`,
    audience,
    locale,
  });
}

module.exports = { LOCALE_BASES, COUNTRY_BY_LOCALE, audienceOf, mailboxFor, homeFor, escapeHtml, thankYouHtml, errorHtml };
