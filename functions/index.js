/**
 * BitePerk contact-form backend.
 *
 * Reached same-origin as POST /api/contact via a Firebase Hosting rewrite
 * (see firebase.json). Flow: validate → write lead to the named Firestore
 * database `biteperk-leads` (the source of truth) → best-effort Zoho SMTP
 * notification → respond. A failed email never fails the request; the saved
 * lead is what matters.
 *
 * Named-DB binding (getFirestore(databaseId)) requires firebase-admin >= 12.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");

initializeApp();
const db = getFirestore("biteperk-leads"); // named DB in australia-southeast1

const ZOHO_SMTP_PASS = defineSecret("ZOHO_SMTP_PASS");

// --- Non-secret config (hardcoded on purpose; only the password is a secret) ---
// Auth as the real mailbox (biteperk@); hello@ is an alias of it. We send From
// the hello@ alias, but Zoho only permits that if the alias's send-as is set up
// — so sendNotification falls back to From the mailbox if the alias is rejected.
const SMTP = { host: "smtp.zoho.com.au", port: 465, secure: true, user: "biteperk@biteperk.com.au" };
const MAIL_FROM = '"Biteperk" <hello@biteperk.com.au>';
const MAIL_FROM_FALLBACK = '"Biteperk" <biteperk@biteperk.com.au>';
const MAIL_TO = "hello@biteperk.com.au";
const MAIL_CC = "biteperk@gmail.com"; // backstop copy
const SITE_URL = "https://biteperk.com.au";
// AU site + the international .com hub (EU/UK/US are served from /en/ and /fr/
// on biteperk.com). Both functions stay in australia-southeast1; only the
// browser Origin allowlist widens so the EU contact form isn't blocked by CORS.
// (International architecture: PLAN.md §7 — "Functions deploy before hosting".)
const ALLOWED_ORIGINS = [
  "https://biteperk.com.au",
  "https://www.biteperk.com.au",
  "https://biteperk.com",
  "https://www.biteperk.com",
  // Firebase staging origin for the global site — without it the contact form
  // is CORS-dead on staging, which is where the EU form gets exercised first.
  "https://biteperk-global.web.app",
];

// Keep in sync with src/data/products.ts (the function can't import the site's TS).
// Legacy voco*/perk* slugs stay accepted during the Vox rename transition —
// cached pages and old outbound links may still post them.
const PRODUCT_SLUGS = new Set([
  "voxtable", "voxorder", "voxconcierge", "voxdrive",
  "vocotable", "vocoorder", "vococoncierge", "vocodrive",
  "perktable", "perkorder", "perkconcierge", "perkdrive",
  "general", "",
]);

const str = (v, max) => (typeof v === "string" ? v : "").trim().slice(0, max); // coerce + cap
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.contactForm = onRequest(
  {
    region: "australia-southeast1",
    secrets: [ZOHO_SMTP_PASS],
    cors: false,
    maxInstances: 5,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      return finish(res, false, 405, "Method not allowed", false);
    }

    // Same-origin only. Browsers always send Origin on cross-site POSTs;
    // curl / native no-JS submits may omit it, which we allow.
    const origin = req.get("origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return finish(res, false, 403, "Forbidden", false);
    }

    const wantsJson = (req.get("accept") || "").includes("application/json");
    const b = req.body && typeof req.body === "object" ? req.body : {};

    // Honeypot: bots fill it, humans don't. Fake success, write nothing.
    if (str(b._gotcha, 100)) return finish(res, true, 200, null, wantsJson);

    const name = str(b.name, 200);
    const email = str(b.email, 320);
    const message = str(b.message, 5000);
    const venue = str(b.venue, 200);
    let product = str(b.product, 60);
    if (!PRODUCT_SLUGS.has(product)) product = "";

    // First-touch campaign attribution (JSON string from the form's hidden
    // field). Stored verbatim (capped) so we can see which campaign drove
    // each lead; never parsed/executed, purely a record on the enquiry.
    const attribution = str(b.attribution, 1000);

    if (!name || !EMAIL_RE.test(email) || !message) {
      return finish(res, false, 400, "Please add your name, a valid email, and a message.", wantsJson);
    }

    let docId;
    try {
      const ref = await db.collection("contactSubmissions").add({
        name,
        email,
        venue: venue || null,
        product: product || null,
        message,
        attribution: attribution || null,
        createdAt: FieldValue.serverTimestamp(),
        userAgent: str(req.get("user-agent"), 500) || null,
        ip: str((req.get("x-forwarded-for") || "").split(",")[0], 60) || null,
      });
      docId = ref.id;
    } catch (e) {
      logger.error("contactForm: Firestore write failed", { msg: e.message });
      return finish(res, false, 500, "Sorry — something went wrong. Please email hello@biteperk.com.au.", wantsJson);
    }

    // Best-effort notification. Never fail the request on email trouble.
    try {
      await sendNotification({ name, email, venue, product, message, docId });
    } catch (e) {
      logger.error("contactForm: email failed (best-effort, lead is saved)", { docId, msg: e.message });
    }

    return finish(res, true, 200, null, wantsJson);
  }
);

/** Send the lead notification via Zoho SMTP with tight timeouts so a broken
 *  mail server can never stall the (already-saved) request for long. */
async function sendNotification({ name, email, venue, product, message, docId }) {
  const transporter = nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.secure,
    auth: { user: SMTP.user, pass: ZOHO_SMTP_PASS.value() },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });

  const subject = `New website enquiry — ${name}${product ? ` · ${product}` : ""}`;
  const text = [
    `New enquiry from the BitePerk website.`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Venue:   ${venue || "—"}`,
    `About:   ${product || "—"}`,
    ``,
    `Message:`,
    message,
    ``,
    `— Reply directly to this email to respond to ${name}.`,
    `(ref: ${docId})`,
  ].join("\n");

  const msg = { to: MAIL_TO, cc: MAIL_CC, replyTo: email, subject, text };

  try {
    await transporter.sendMail({ ...msg, from: MAIL_FROM }); // From the hello@ alias
  } catch (e) {
    // Zoho rejects send-as if the hello@ alias isn't set up for this mailbox.
    // Retry From the authenticated mailbox so the lead notification still lands.
    logger.warn("contactForm: alias From rejected, retrying from mailbox", { docId, msg: e.message });
    await transporter.sendMail({ ...msg, from: MAIL_FROM_FALLBACK });
  }
}

/** JSON for the fetch() path; branded full-page HTML only for the no-JS native submit. */
function finish(res, ok, status, error, wantsJson) {
  if (wantsJson) {
    return res.status(ok ? 200 : status).json(ok ? { ok: true } : { ok: false, error });
  }
  res.set("Content-Type", "text/html; charset=utf-8");
  return res.status(ok ? 200 : status).send(ok ? thankYouHtml() : errorHtml(error));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function page(title, heading, body) {
  // Self-contained, inline styles only (no inline <script>) so it stays clean
  // under the site CSP. Reached only when JavaScript is disabled.
  return `<!doctype html>
<html lang="en-AU">
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
    <a class="btn" href="${SITE_URL}/">Back to biteperk.com.au →</a>
  </main>
</body>
</html>`;
}

function thankYouHtml() {
  return page(
    "Message sent",
    "Thanks — we'll be in touch.",
    "Your message has reached the BitePerk team. We usually reply within a few hours during business hours (Mon–Fri, 9am–5pm AEST)."
  );
}

function errorHtml(error) {
  return page(
    "Something went wrong",
    "That didn't go through.",
    `${escapeHtml(error || "Please try again.")} You can also email us directly at <a style="color:#F5C418" href="mailto:hello@biteperk.com.au">hello@biteperk.com.au</a>.`
  );
}

/**
 * Privacy-friendly analytics proxy (Plausible).
 *
 * Reached same-origin as POST /api/event via a Firebase Hosting rewrite —
 * keeps the CSP at connect-src 'self' with no third-party request from the
 * browser. Forwards the raw event body plus the visitor's UA and client IP
 * (both required by Plausible for correct unique-visitor counting; neither
 * is stored by us). Fire-and-forget: analytics must never break the site,
 * so every failure path still returns 202.
 *
 * Inert until the Plausible site (biteperk.com.au) exists AND the client
 * flag in src/scripts/analytics.ts is flipped to true.
 */
exports.analyticsEvent = onRequest(
  {
    region: "australia-southeast1",
    cors: false,
    maxInstances: 3,
    timeoutSeconds: 10,
    memory: "128MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      return res.status(405).end();
    }
    const origin = req.get("origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return res.status(403).end();
    try {
      await fetch("https://plausible.io/api/event", {
        method: "POST",
        headers: {
          "Content-Type": req.get("content-type") || "application/json",
          "User-Agent": req.get("user-agent") || "",
          "X-Forwarded-For": (req.get("x-forwarded-for") || "").split(",")[0].trim(),
        },
        body: req.rawBody,
      });
    } catch (e) {
      logger.warn("analytics forward failed", e);
    }
    return res.status(202).end();
  }
);
