/**
 * Render the French review as a shareable HTML page (published as an Artifact).
 *
 * Committed for the same reason as extract-fr-review.mjs: the original was lost
 * to a session scratchpad hours after the review went out. See that file's header.
 *
 * It builds from `collectClusters()` — the SAME extraction the markdown uses —
 * rather than re-parsing the markdown the way the first version did. One
 * extraction, two renderings; there is no parser between them to disagree with.
 *
 * The page is authored for the Artifact publisher: a `<title>` first, no
 * doctype/html/head/body wrapper, and Google Fonts as the only external
 * resource (the one stylesheet host the CSP allows).
 *
 * Usage: node scripts/build/build-review-page.mjs [--out <path>]
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";
import { collectClusters, META } from "./extract-fr-review.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(resolve(HERE, "review-page.css"), "utf8");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `code` spans in the config's prose survive into the page as real <code>. */
const ticks = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

/** A row key is either a `path` or a prose "where" string; both may hold ticks. */
const keyCell = (key) =>
  /^`[^`]+`$/.test(key)
    ? `<div class="key"><code>${esc(key.slice(1, -1))}</code></div>`
    : `<div class="key"><span class="where-key">${ticks(key)}</span></div>`;

const MARK = `<svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
        <polygon points="32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24"
                 fill="#f5c418" stroke="#1a4d1a" stroke-width="1.2" stroke-linejoin="round"/>
        <rect x="29" y="20" width="2.5" height="22" rx="0.8" fill="#1a4d1a"/>
        <rect x="32.5" y="20" width="2.5" height="14" rx="0.8" fill="#1a4d1a"/>
        <rect x="35.5" y="20" width="2.5" height="22" rx="0.8" fill="#1a4d1a"/>
      </svg>`;

function section(c) {
  const blocking = c.blocking?.startsWith("**Yes");
  const rows = c.data
    .map(
      (r) => `        <div class="row">
          ${keyCell(r.key)}
          <div class="pair">
            <div class="lang"><span class="tag">EN</span><p>${esc(r.en)}</p></div>
            <div class="lang fr"><span class="tag">FR</span><p>${esc(r.fr)}</p></div>
          </div>
        </div>`,
    )
    .join("\n");

  return `      <section id="c${c.n}" class="cluster${blocking ? " is-blocking" : ""}">
        <header class="cluster-head">
          <div class="cluster-id">${esc(c.n)}</div>
          <div>
            <h2>${ticks(c.title.replace(/ ⚠️ BLOCKING$/, ""))}</h2>
            <p class="where">${ticks(c.where)} · <code>${esc(c.source)}</code> · ${c.data.length} lines</p>
          </div>
          ${blocking ? `<span class="badge">Blocks Paris &amp; Brussels-FR</span>` : ""}
        </header>
        ${c.note ? `<p class="blocker-note">${ticks(c.note)}</p>` : ""}
        <div class="rows">
${rows}</div>
      </section>`;
}

export async function buildPage() {
  const clusters = await collectClusters();
  const total = clusters.reduce((n, c) => n + c.data.length, 0);
  const blocking = clusters.find((c) => c.blocking?.startsWith("**Yes"));

  const nav = clusters
    .map(
      (c) =>
        `      <a href="#c${c.n}"${c === blocking ? ' class="nav-blocking"' : ""}><span>${esc(c.n)}</span>${ticks(
          c.summaryTitle?.replace(/\*\*/g, "") ?? c.title.replace(/ ⚠️ BLOCKING$/, ""),
        )}<em>${c.data.length}</em></a>`,
    )
    .join("\n");

  return `<title>French Copy Review</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..700;1,14..32,400..700&display=swap">
<style>
${CSS}</style>

<div class="masthead">
  <div class="wrap">
    <div class="brandline">
      ${MARK}
      <span class="brand-name">bite<span class="perk">perk</span></span>
    </div>
    <h1>French copy review</h1>
    <p class="sub">Every line of French written for the international site since your July pass — ${total} lines, side by side with the English they came from.</p>
    <div class="meta">
      <span>Prepared for ${esc(META.preparedFor)}</span>
      <span>${esc(META.date)}</span>
      <span>${clusters.length} clusters · ${total} lines</span>
      ${blocking ? `<span class="accent">Cluster ${esc(blocking.n)} blocks the city pages</span>` : ""}
    </div>
  </div>
</div>

<div class="intro">
  <div class="wrap cols">
    <div>
      <h3>What this is</h3>
      <p>BitePerk's international site ships in five trees — <strong>/en</strong>, <strong>/gb-en</strong>, <strong>/fr</strong>, <strong>/be-en</strong> and <strong>/be-fr</strong>. The French you reviewed on <strong>${esc(META.sincePass)}</strong> is live and untouched. This collects only the French written <em>since</em> then, which has never had a native pass.</p>
      <p>All of it is either already on the site or one merge away, so a correction here changes what a French visitor reads. One cluster is a hard blocker: the <strong>city-page furniture</strong> gates every future French city page — Paris and the French side of Brussels are waiting on it.</p>
      <h3 style="margin-top:26px">How to send corrections</h3>
      <p>Each line carries its <strong>reference key</strong> in gold — <code style="font-family:var(--font-mono);font-size:.8125rem">nav.products</code> and the like. Quote that key in your reply and we'll know exactly which line you mean. Skip anything that reads fine; a short note like "too familiar" is as useful as a rewrite.</p>
    </div>
    <div>
      <h3>Register &amp; constraints</h3>
      <ul>
        <li><strong>Vouvoiement throughout</strong> — professional but not stiff, the same voice as the July copy.</li>
        <li>The audience is <strong>restaurant and hotel operators</strong>, not developers. Plain words beat technical ones.</li>
        <li>We describe a <strong>pilot programme</strong>, never a shipped European product: there is no European office, no European phone line, no local staff. If a line implies otherwise, that's a bug worth flagging.</li>
        <li>Legal phrasing — the RGPD article, the AI Act citation — is deliberate and checked by automated tests. Please correct the French, but flag rather than delete a citation.</li>
        <li>The two French trees are deliberately <strong>worded differently from each other</strong>: an automated check measures how similar /fr and /be-fr are, so they must not converge.</li>
      </ul>
    </div>
  </div>
</div>

<div class="index">
  <div class="wrap">
    <h3>The clusters</h3>
    <nav class="nav">
${nav}
    </nav>
  </div>
</div>

<main class="wrap">

${clusters.map(section).join("\n\n")}

</main>

<footer>
  <div class="wrap">
    <h3>What happens next</h3>
    <ol>
      <li>We apply your corrections and drop the draft markers.</li>
      <li>The city-page furniture unblocks Paris and Brussels-FR — those pages get written next.</li>
      <li>VoxStay's French goes from draft to prospect-ready.</li>
    </ol>
    <p style="margin-top:18px; color:var(--mist); font-size:.875rem;">Thank you — this is the pass that lets the French side of the site grow.</p>
  </div>
</footer>
`;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const i = process.argv.indexOf("--out");
  const html = await buildPage();
  if (i !== -1) {
    writeFileSync(process.argv[i + 1], html);
    console.log(`build-review-page: ${process.argv[i + 1]} — ${(html.length / 1024).toFixed(1)}KB`);
  } else process.stdout.write(html);
}
