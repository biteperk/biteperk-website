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

/** The redirect-only AU country-code host (front door → AU_HOME). Derived. */
export const AU_CCTLD =
  locales.find((l) => l.market === "au")?.cctld ?? "https://biteperk.com.au";

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

/** The absolute origin (never includes a base path). */
export function currentOrigin(): string {
  return ORIGIN;
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

/** Build the absolute URL for a page path within a specific locale. */
export function localeUrl(locale: Locale, pagePath = ""): string {
  const clean = pagePath.replace(/^\/+/, "");
  return `${ORIGIN}${locale.base}/${clean}`.replace(/\/$/, "/"); // keep trailing slash on home
}

// ── International page scaffold ──────────────────────────────────────────────
export type Alternate = { readonly hreflang: string; readonly href: string };

/**
 * Pages emitted under every global locale (path within the locale; "" = home).
 */
export const INTL_PAGE_PATHS: readonly string[] = [
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
];

/**
 * THE LAUNCH FLAG (env-driven; default OFF). While off (the safe default):
 * every global locale stays `noindex` and NO cross-domain hreflang is emitted — output is
 * byte-identical to the pre-international-launch site. Launch in ONE deploy with
 *   INTL_LAUNCHED=true npm run build:site
 * which (a) makes the global locales indexable and (b) emits the reciprocal
 * cross-locale hreflang cluster on shared pages. These must go live together
 * — see the runbook's launch step.
 */
export const INTL_LAUNCHED =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.INTL_LAUNCHED === "true";

/**
 * Base-less page paths that exist in ALL locales (au-en + en + fr) and so form
 * the 3-way hreflang cluster. Everything else is single- or two-locale:
 * AU-only pages (products, cities, blog, /technology, /platform) emit no
 * cross-domain hreflang; /how-it-works exists only under /en + /fr.
 */
export const SHARED_PAGE_PATHS: readonly string[] = [
  "/",
  "/about/",
  "/contact/",
  "/legal/privacy/",
  "/legal/terms/",
];

/** Is this base-less path shared across au-en + en + fr? */
export function isSharedPage(baseLessPath: string): boolean {
  return SHARED_PAGE_PATHS.includes(baseLessPath);
}

/**
 * Does a page (base-less "/x/" form) exist in a given locale?
 *   - Every GLOBAL locale emits exactly INTL_PAGE_PATHS.
 *   - The AU locale's full route list is much larger, but for cross-locale
 *     carrying only the SHARED set matters (products/cities/blog have no
 *     global counterpart, and how-it-works has no AU counterpart).
 */
export function pageExistsInLocale(baseLessPath: string, locale: Locale): boolean {
  if (locale.target === "global") {
    const asIntl = baseLessPath.replace(/^\/|\/$/g, ""); // "/about/" → "about"
    return INTL_PAGE_PATHS.includes(asIntl);
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
 * The COMPLETE reciprocal hreflang cluster for a page across ALL live locales
 * (au-en + en + fr) plus exactly one x-default. Every page on every host emits
 * the same cluster, so Google can map the properties as alternates.
 *
 * `pagePath` is the page path WITHIN its locale ("" = the locale home,
 * "products/voxtable/" = a deeper page). For pages that only exist in some
 * locales, pass the subset via `only`.
 */
export function buildHreflang(
  pagePath = "",
  only?: readonly BuildTarget[],
): { alternates: Alternate[]; xDefault: string } {
  const clean = pagePath.replace(/^\/+/, "");
  const pool = only ? locales.filter((l) => only.includes(l.target)) : locales;
  const alternates: Alternate[] = [];
  for (const l of pool) {
    const href = `${ORIGIN}${l.base}/${clean}`;
    for (const code of l.hreflang) alternates.push({ hreflang: code, href });
  }
  const x = pool.find((l) => l.xDefault) ?? pool[0];
  return { alternates, xDefault: `${ORIGIN}${x.base}/${clean}` };
}

/** Expected `dir/index.html` routes for a build target (drives check-routes). */
export function pageRoutesForTarget(target: BuildTarget): string[] {
  if (target !== "global") return [];
  const out: string[] = [];
  for (const l of localesForTarget("global")) {
    const seg = l.base.replace(/^\//, "");
    for (const p of INTL_PAGE_PATHS) {
      const full = [seg, p].filter(Boolean).join("/");
      out.push(`${full}/index.html`);
    }
  }
  return out;
}
