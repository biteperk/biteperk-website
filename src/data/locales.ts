/**
 * Single source of truth for the site's locales, origin, and base paths.
 *
 * Single-domain international architecture (Option B, rev.3) — see
 * deliverables/2026-07-23-intl-site-architecture/PLAN.md.
 *
 * ONE domain, biteperk.com, addressed Accenture-style with a base path per
 * locale (accenture.com/au-en, /be-en, /fr-fr …):
 *
 *   au-en  → biteperk.com/au-en   the Australian site (was biteperk.com.au root)
 *   en     → biteperk.com/en      international English, the x-default
 *   gb-en  → biteperk.com/gb-en   United Kingdom
 *   fr     → biteperk.com/fr      France (fr-FR + generic fr)
 *   be-en  → biteperk.com/be-en   Belgium — English
 *   be-fr  → biteperk.com/be-fr   Belgique — Français
 *
 * biteperk.com.au is a redirect-only host → 301 → biteperk.com/au-en/** .
 *
 * BUILD_TARGET selects which locale subset a build pass emits, and — because
 * Astro's `base` is one value per build — which base path Astro prefixes onto
 * its own bundled assets and the sitemap:
 *   au     → Astro base "/au-en"; emits the au-en locale.        → dist/
 *   global → Astro base "/" (root); emits every global locale via [...intl]. → dist-global/
 * A post-build merge (scripts/build/merge-dist.mjs) relocates the au build under
 * /au-en/** and lays the en+fr trees at the root of one biteperk.com deploy.
 *
 * Astro only base-prefixes its OWN managed assets + the sitemap. Every literal
 * URL the code writes — internal links, /og and /images assets, canonical, OG,
 * JSON-LD @id/url — must be routed through the helpers below (`u`, `abs`) so it
 * carries the locale base. The check-links gate fails the build if one escapes.
 */

import { PRODUCT_SLUGS } from "./product-slugs";
import { RENDERABLE_SOLUTION_SLUGS } from "./solutions";
import { RESOURCE_TYPE_BY_SEGMENT } from "./resources";
// Node-only (reads frontmatter). locales.ts is a server/build module — no
// client script imports it; if one ever does, Vite fails the build loudly.
import { intlResourcesForBase } from "../../scripts/build/content-index.mjs";
import { intlCityPaths } from "./intl/cities";

export type BuildTarget = "au" | "global";

/**
 * The two LANGUAGE CORES that have full copy records (src/data/intl/copy.ts).
 * Every locale renders one core; market colour is layered on top via the
 * per-locale overrides in src/data/intl/markets.ts. Adding a third language
 * (e.g. nl) means widening this union AND writing a full copy core.
 */
export type Lang = "en" | "fr";

/** Informational market grouping — overrides key on `base`, not on this. */
export type Market = "au" | "int" | "gb" | "fr" | "be";

export type Locale = {
  /** URL base path under the origin, no trailing slash. e.g. "/au-en", "/en". */
  readonly base: string;
  /** `<html lang>` value for pages in this locale, e.g. "en-GB", "fr-BE". */
  readonly lang: string;
  /** Which copy core renders this locale (en-GB and en-BE both render `en`). */
  readonly copyLang: Lang;
  /** Which market this locale serves. */
  readonly market: Market;
  /** og:locale value (underscored), e.g. "en_AU". */
  readonly ogLocale: string;
  /** hreflang region codes this locale legitimately serves. */
  readonly hreflang: readonly string[];
  /** Human label for the region/language picker menu. */
  readonly label: string;
  /**
   * 2–3 char chip shown in the picker's collapsed trigger. The full `label`
   * only ever appears inside the open menu — the nav bar cannot afford the
   * ~200px a spelled-out label costs (see Nav.astro's width budget).
   */
  readonly short: string;
  /** The one x-default of the whole hreflang cluster. Exactly one locale sets this. */
  readonly xDefault?: boolean;
  /** The build target that emits this locale. */
  readonly target: BuildTarget;
  /**
   * Country-code front-door domain that 301s into this locale, if one exists
   * (Accenture model: biteperk.com.au → /au-en, biteperk.uk → /gb-en,
   * biteperk.fr → /fr, biteperk.be → /be-en). The com.au redirect lives in
   * firebase.json (Firebase host); the uk/fr/be redirects live in Cloudflare
   * Redirect Rules — deliberately NOT in firebase.json. See
   * docs/accounts-and-ops-log.md for the exact rule expressions.
   */
  readonly cctld?: string;
};

/** The one origin every locale is served from. */
export const ORIGIN = "https://biteperk.com";

/** Canonical home of the Australian site — the entity anchor (stable everywhere). */
export const AU_BASE = "/au-en";
export const AU_HOME = `${ORIGIN}${AU_BASE}`;

/**
 * The full locale cluster. Order matters only for display; the hreflang gate
 * asserts reciprocity + exactly one x-default regardless.
 */
export const locales: readonly Locale[] = [
  {
    base: "/au-en",
    lang: "en-AU",
    copyLang: "en",
    market: "au",
    ogLocale: "en_AU",
    hreflang: ["en-AU"],
    label: "Australia — English",
    short: "AU",
    target: "au",
    cctld: "https://biteperk.com.au",
  },
  {
    base: "/en",
    lang: "en",
    copyLang: "en",
    market: "int",
    ogLocale: "en",
    hreflang: ["en"],
    label: "International — English",
    short: "EN",
    xDefault: true,
    target: "global",
  },
  {
    base: "/gb-en",
    lang: "en-GB",
    copyLang: "en",
    market: "gb",
    ogLocale: "en_GB",
    hreflang: ["en-GB"],
    label: "United Kingdom — English",
    short: "UK",
    target: "global",
    cctld: "https://biteperk.uk",
  },
  {
    // France claims fr-FR explicitly (against fr-BE) AND keeps generic `fr`
    // as the catch-all for French speakers outside FR/BE. Multiple hreflang
    // codes on one URL is valid; the gate derives from this same array so
    // emitter and checker can never disagree.
    base: "/fr",
    lang: "fr",
    copyLang: "fr",
    market: "fr",
    ogLocale: "fr_FR",
    hreflang: ["fr-FR", "fr"],
    label: "France — Français",
    short: "FR",
    target: "global",
    cctld: "https://biteperk.fr",
  },
  {
    base: "/be-en",
    lang: "en-BE",
    copyLang: "en",
    market: "be",
    ogLocale: "en_GB",
    hreflang: ["en-BE"],
    label: "Belgium — English",
    short: "BE",
    target: "global",
    cctld: "https://biteperk.be",
  },
  {
    base: "/be-fr",
    lang: "fr-BE",
    copyLang: "fr",
    market: "be",
    ogLocale: "fr_BE",
    hreflang: ["fr-BE"],
    label: "Belgique — Français",
    short: "BE",
    target: "global",
  },
];

/**
 * Every country-code front-door domain in the estate, derived from the locale
 * array (single source of truth) — consumed by schema.ts `sameAs` so Google
 * links each front door to the one BitePerk org.
 */
export const CCTLDS: readonly string[] = locales
  .map((l) => l.cctld)
  .filter((c): c is string => Boolean(c));

export const DEFAULT_TARGET: BuildTarget = "au";

/** Resolve a BUILD_TARGET env value, defaulting to `au`. */
export function resolveTarget(value?: string | null): BuildTarget {
  return value === "global" ? "global" : "au";
}

/** BUILD_TARGET from the build-time environment (undefined in the browser). */
function envTarget(): string | undefined {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.BUILD_TARGET;
}

/** The build target this pass is emitting (defaults to `au`). */
export function currentTarget(): BuildTarget {
  return resolveTarget(envTarget());
}

/** Locales emitted by a given build target. */
export function localesForTarget(target: BuildTarget): readonly Locale[] {
  return locales.filter((l) => l.target === target);
}

/**
 * The Astro `base` path of the CURRENT build, no trailing slash.
 *   au     → "/au-en"  (single-locale build; base applies to every page)
 *   global → ""        (root; the /en and /fr prefixes are part of each route)
 * Mirrors the BASE constant in astro.config.mjs.
 */
export function currentBasePath(): string {
  return currentTarget() === "au" ? AU_BASE : "";
}

/**
 * Prefix an app-absolute path ("/products/") with the current build's base
 * ("/au-en/products/"). Non-absolute inputs (relative, external, #, mailto,
 * tel) are returned untouched. Idempotent: never double-prefixes.
 */
export function u(path: string): string {
  if (!path.startsWith("/")) return path;
  const base = currentBasePath();
  if (!base) return path;
  if (path === base || path.startsWith(base + "/")) return path; // already prefixed
  return base + path;
}

/** Strip a leading current-base from a path, yielding a base-less app path. */
export function stripBase(path: string): string {
  const base = currentBasePath();
  if (base && (path === base || path.startsWith(base + "/"))) {
    const rest = path.slice(base.length);
    return rest.startsWith("/") ? rest : "/" + rest;
  }
  return path;
}

/** Absolute URL on the current origin + base, for canonical / OG / JSON-LD. */
export function abs(path: string): string {
  return ORIGIN + u(path);
}

/**
 * Absolute home URL of a specific locale (origin + its base).
 * Trailing slash kept so this matches what buildHreflang() and u("/") emit —
 * a picker link that differs from the canonical only by the slash costs an
 * extra redirect hop and muddies the hreflang signal.
 */
export function localeHome(locale: Locale): string {
  return `${ORIGIN}${locale.base}/`;
}

// Removed Jul 2026: AU_CCTLD, currentOrigin() and localeUrl() were exported
// here and referenced nowhere in src/, scripts/, tests/ or astro.config.mjs.
// localeUrl() also carried a no-op — `.replace(/\/$/, "/")` swapped a trailing
// slash for a trailing slash under a comment claiming it "keeps trailing slash
// on home", when nothing was removing it. Use localeHome() for a locale's home
// and localeSwitchUrl() to carry a page across locales; both are live and
// tested. Dead code in the international SSOT is worse than dead code anywhere
// else, because everything derives from this file.

// ── International page scaffold ──────────────────────────────────────────────
export type Alternate = { readonly hreflang: string; readonly href: string };

/**
 * Pages EVERY global locale emits (path within the locale; "" = home).
 */
/**
 * The AU tree's STATIC pages, base-less and without the dynamic ones.
 *
 * Cities and blog guides are excluded on purpose — both are derived from their
 * own sources (`cities.ts`, the blog collection) by every consumer, and that
 * half never drifted. This is the half that did: `tests/helpers/routes.ts` and
 * `scripts/gates/check-routes.mjs` each carried their own hand-written copy of
 * this list, in different shapes (`/au-en/products/` vs `products/index.html`),
 * under a comment in the former claiming the two "cannot drift". They could,
 * and nothing would have caught it — the gate would simply stop expecting a
 * page while the e2e suite stopped visiting it.
 *
 * Products derive from PRODUCT_SLUGS, same as INTL_CORE_PAGES below.
 */
export const AU_STATIC_PAGES: readonly string[] = [
  "",
  "products",
  ...PRODUCT_SLUGS.map((s) => `products/${s}`),
  "solutions",
  // Same predicate as [slug].astro's getStaticPaths (live + draft) — never
  // the full SOLUTION_SLUGS, or a "planned" entry breaks check-routes.
  ...RENDERABLE_SOLUTION_SLUGS.map((s) => `solutions/${s}`),
  // The resources HUB only. Category pages (/resources/<segment>/) exist only
  // for types with ≥1 published post — an empty, indexable "nothing here yet"
  // page is a thin-page signal — so they are content-derived: check-routes and
  // tests/helpers/routes.ts append them from scripts/build/content-index.mjs
  // + resources.ts, and [type].astro builds them from the collection.
  "resources",
  "contact",
  "about",
  "technology",
  "platform",
  "blog",
  "legal",
  "legal/privacy",
  "legal/terms",
  "legal/cookies",
];

const INTL_CORE_PAGES: readonly string[] = [
  "",
  "about",
  "contact",
  "how-it-works",
  "legal/privacy",
  "legal/terms",
  // Every locale MUST emit this: the cookie banner links to it, and a consent
  // notice whose policy link 404s is a compliance failure — least acceptable
  // in exactly these markets (UK GDPR, CNIL, Belgian DPA).
  "legal/cookies",
  // The product pages are CORE, not per-market extras. A VoxTable page says
  // the same thing in Cardiff and Antwerp, so every locale emits the same set
  // and they declare each other as hreflang alternates — one page, several
  // regional audiences, which is exactly what hreflang is for. Forking product
  // prose per market to look busier would manufacture the near-duplicate
  // problem check-cities exists to catch. Derived from PRODUCT_SLUGS so a
  // fifth product needs no edit here.
  "products",
  ...PRODUCT_SLUGS.map((s) => `products/${s}`),
  // Solution verticals are CORE for the same reason products are: language-
  // level prose (intl/solutions.ts), alternates of each other across the
  // English trees. Same predicate as the AU tree (renderable = live + draft).
  "solutions",
  ...RENDERABLE_SOLUTION_SLUGS.map((s) => `solutions/${s}`),
];

/**
 * Pages emitted under SOME locales only, keyed by Locale.base.
 *
 * Market depth is inherently uneven, and the flat list this replaced could not
 * express either half of that: `/gb-en/london/` is a UK page with no
 * counterpart in any other tree, while `/be-en/brussels/` and
 * `/be-fr/brussels/` ARE genuine alternates of each other. Everything derived
 * from the page list — the route gate, the `[...intl]` page tree, the hreflang
 * cluster, the e2e route list, the OG cards — now inherits that per-locale
 * shape from here, so adding a market page stays a one-line data edit.
 *
 * Deliberately empty at first: the mechanism ships before the content, so the
 * gates that police uneven trees are proven against a tree we already trust.
 */
const INTL_EXTRA_PAGES: Readonly<Record<string, readonly string[]>> = {
  // UK-only, and correctly so. Biteperk Ltd (company 17379647) is registered in
  // England and Wales; SI 2015/17 reg 25 and the E-Commerce Regulations 2002
  // reg 6 attach their website-disclosure duties to that company's own trading
  // site. There is no French or Belgian entity, so a "company details" page on
  // /fr or /be-* would disclose nothing and imply a presence that does not
  // exist. Being a singleton is also the point: it exercises the uneven-tree
  // machinery — buildHreflang self-references it, check-hreflang derives the
  // expected code set per page, and both were built for exactly this shape.
  "/gb-en": ["legal/company-details"],
};

/** Resources routes for a base — content-derived (scripts/build/content-index.mjs). */
export function intlResourcePaths(base: string): readonly string[] {
  const posts = intlResourcesForBase(base);
  if (posts.length === 0) return [];
  const segmentOf = (type: string) => Object.entries(RESOURCE_TYPE_BY_SEGMENT).find(([, id]) => id === type)?.[0];
  const segments = [...new Set(posts.map((p) => segmentOf(p.type)).filter((s): s is string => Boolean(s)))];
  return [
    "resources",
    ...segments.map((s) => `resources/${s}`),
    ...posts.map((p) => `resources/${segmentOf(p.type)}/${p.slug}`),
  ];
}

/**
 * Every page path a locale emits.
 *
 * Global locales only. The AU tree's routes are not enumerable here — they
 * come from `getStaticPaths` over cities.ts, products.ts and the blog
 * collection — so this returns [] for it rather than pretending otherwise.
 */
export function pagesForLocale(locale: Locale): readonly string[] {
  if (locale.target !== "global") return [];
  return [
    ...INTL_CORE_PAGES,
    ...(INTL_EXTRA_PAGES[locale.base] ?? []),
    // Derived, never listed by hand: a city that is `published` in
    // intl/cities.ts gets its route, its hreflang cluster, its e2e coverage
    // and its OG-card requirement from that one flag.
    ...intlCityPaths(locale.base),
    // Resources: hub + populated category pages + articles, only where the
    // collection has an article for this base (a French tree with no French
    // article gets no empty hub). Same rule as the AU tree.
    ...intlResourcePaths(locale.base),
  ];
}

/**
 * THE LAUNCH FLAG (env-driven; default OFF). While off (the safe default):
 * every global locale stays `noindex` and NO cross-domain hreflang is emitted — output is
 * byte-identical to the pre-international-launch site. Launch in ONE deploy with
 *   INTL_LAUNCHED=true npm run build:site
 * which (a) makes the global locales indexable and (b) emits the reciprocal
 * cross-locale hreflang cluster on shared pages. These must go live together
 * — see the runbook's launch step.
 */
function parseLaunchFlag(raw: string | undefined): boolean {
  // Unset is the safe default: not launched.
  if (raw === undefined || raw === "") return false;
  const v = raw.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  // Anything else is a typo, and the old `=== "true"` test swallowed it: the
  // build silently came out noindex while the operator believed they had just
  // launched five markets. A launch is a deliberate five-market decision, so
  // an unreadable flag must stop the build rather than pick a side.
  throw new Error(
    `INTL_LAUNCHED=${JSON.stringify(raw)} is not a boolean. ` +
      `Use true/1/yes/on or false/0/no/off, or leave it unset for the default (not launched).`,
  );
}

export const INTL_LAUNCHED = parseLaunchFlag(
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.INTL_LAUNCHED,
);

/**
 * Base-less page paths the AU tree shares with the global trees — i.e. the
 * pages on which AU joins the cross-domain cluster. AU-only pages (products,
 * cities, blog, /technology, /platform) emit no cross-domain hreflang, and
 * /how-it-works is global-only, so neither appears here.
 *
 * This is only ever consulted for the AU locale; which pages a GLOBAL locale
 * has is pagesForLocale()'s business.
 */
export const SHARED_PAGE_PATHS: readonly string[] = [
  "/",
  "/about/",
  "/contact/",
  "/legal/privacy/",
  "/legal/terms/",
  // Both trees emit this (AU has had it all along; every global locale gained
  // it with the consent-banner fix), so it belongs in the cluster. It was
  // missed when the intl cookie pages landed.
  "/legal/cookies/",
  // The product pages now exist on BOTH trees at the same paths, and they are
  // genuine regional equivalents — same product, AU pricing on /au-en versus
  // pilot framing in Europe — which is precisely the "same page, different
  // region" relationship hreflang expresses. Clustering them also lets the new
  // market pages inherit signal from the AU pages that are already indexed.
  //
  // Not optional bookkeeping: this list is what makes the region picker carry a
  // visitor across a switch. Without it, /fr/products/voxtable/ → Australia
  // would land on the AU HOME while the AU product page sat right there — an
  // asymmetry the unit test caught the moment the intl pages appeared.
  "/products/",
  ...PRODUCT_SLUGS.map((s) => `/products/${s}/`),
];

/** Is this base-less path shared across au-en + en + fr? */
export function isSharedPage(baseLessPath: string): boolean {
  return SHARED_PAGE_PATHS.includes(baseLessPath);
}

/**
 * Does a page (base-less "/x/" form) exist in a given locale?
 *   - A GLOBAL locale emits exactly pagesForLocale(it) — core + its extras.
 *   - The AU locale's full route list is much larger, but for cross-locale
 *     carrying only the SHARED set matters (products/cities/blog have no
 *     global counterpart, and how-it-works has no AU counterpart).
 */
export function pageExistsInLocale(baseLessPath: string, locale: Locale): boolean {
  if (locale.target === "global") {
    const asIntl = baseLessPath.replace(/^\/|\/$/g, ""); // "/about/" → "about"
    return pagesForLocale(locale).includes(asIntl);
  }
  return isSharedPage(baseLessPath);
}

/**
 * The locale a SERVED path belongs to, matched by base-path prefix
 * ("/au-en/contact/" → au-en). Falls back to the cluster's x-default so the
 * picker always has something to mark as current.
 *
 * Deliberately keyed off the served path, not the build target: that's the one
 * signal that reads identically under Astro's `base` (au) and at the root
 * (global), so one picker component works on both builds.
 */
export function localeFromPath(path: string): Locale {
  return (
    locales.find((l) => path === l.base || path.startsWith(l.base + "/")) ??
    locales.find((l) => l.xDefault) ??
    locales[0]
  );
}

/**
 * Where the picker sends a visitor who switches to `to` while on `path`.
 *
 * We carry the visitor to the SAME page across the switch whenever that page
 * exists in the target locale (/au-en/contact/ → /fr/contact/, and
 * /gb-en/how-it-works/ → /fr/how-it-works/) — landing someone back on a home
 * page is the classic region-picker annoyance. Pages with no counterpart
 * (AU products/cities/blog; how-it-works when switching to AU) fall back to
 * the target locale's home rather than 404.
 */
export function localeSwitchUrl(path: string, to: Locale): string {
  const from = localeFromPath(path);
  const rest = path.slice(from.base.length) || "/";
  const page = rest.endsWith("/") ? rest : rest + "/";
  return pageExistsInLocale(page, to) ? `${ORIGIN}${to.base}${page}` : localeHome(to);
}

/**
 * The reciprocal hreflang cluster for a page, plus exactly one x-default.
 *
 * `pagePath` is the page path WITHIN its locale ("" = the locale home,
 * "products/voxtable/" = a deeper page). `only` narrows by build target —
 * pre-launch the global build clusters among global locales alone.
 *
 * SUBSET-AWARE: a locale joins the cluster only if it actually emits the page
 * (pageExistsInLocale). This is what makes uneven market depth safe —
 * /be-en/brussels/ and /be-fr/brussels/ cluster as the true alternates they
 * are, while /gb-en/london/ is a singleton pointing only at itself. Listing
 * every locale unconditionally, as this did while every tree was identical,
 * would have advertised four 404s per UK city page the moment one shipped.
 *
 * An empty cluster is always a bug (a page must at minimum exist in its own
 * locale), so it throws at build time rather than emitting nothing.
 */
export function buildHreflang(
  pagePath = "",
  only?: readonly BuildTarget[],
): { alternates: Alternate[]; xDefault: string } {
  const clean = pagePath.replace(/^\/+/, "");
  const baseLess = clean ? `/${clean}` : "/";
  const pool = (only ? locales.filter((l) => only.includes(l.target)) : locales).filter((l) =>
    pageExistsInLocale(baseLess, l),
  );
  if (pool.length === 0)
    throw new Error(
      `buildHreflang: no locale emits "${baseLess}" — an hreflang cluster cannot be empty. ` +
        `Add the path to INTL_EXTRA_PAGES/SHARED_PAGE_PATHS, or stop calling this for it.`,
    );
  const alternates: Alternate[] = [];
  for (const l of pool) {
    const href = `${ORIGIN}${l.base}/${clean}`;
    for (const code of l.hreflang) alternates.push({ hreflang: code, href });
  }
  // x-default is the cluster's fallback, so it must be a member of the
  // cluster: on a subset page the global x-default (/en) is often absent.
  const x = pool.find((l) => l.xDefault) ?? pool[0];
  return { alternates, xDefault: `${ORIGIN}${x.base}/${clean}` };
}

/** Expected `dir/index.html` routes for a build target (drives check-routes). */
export function pageRoutesForTarget(target: BuildTarget): string[] {
  if (target !== "global") return [];
  const out: string[] = [];
  for (const l of localesForTarget("global")) {
    const seg = l.base.replace(/^\//, "");
    for (const p of pagesForLocale(l)) {
      const full = [seg, p].filter(Boolean).join("/");
      out.push(`${full}/index.html`);
    }
  }
  return out;
}
