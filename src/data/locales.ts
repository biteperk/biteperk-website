/**
 * Single source of truth for the site's locales, origin, and base paths.
 *
 * Single-domain international architecture (Option B, rev.3) — see
 * deliverables/2026-07-23-intl-site-architecture/ACCENTURE-GRADE-INTL-PLAN.md.
 *
 * ONE domain, biteperk.com, addressed Accenture-style with a base path per
 * locale (accenture.com/au-en, /be-en, /fr-fr …):
 *
 *   au-en  → biteperk.com/au-en   the Australian site (was biteperk.com.au root)
 *   en     → biteperk.com/en      international English, the x-default
 *   fr     → biteperk.com/fr      international French
 *
 * biteperk.com.au is a redirect-only host → 301 → biteperk.com/au-en/** .
 *
 * BUILD_TARGET selects which locale subset a build pass emits, and — because
 * Astro's `base` is one value per build — which base path Astro prefixes onto
 * its own bundled assets and the sitemap:
 *   au     → Astro base "/au-en"; emits the au-en locale.        → dist/
 *   global → Astro base "/" (root); emits en + fr via [...intl]. → dist-global/
 * A post-build merge (scripts/merge-dist.mjs) relocates the au build under
 * /au-en/** and lays the en+fr trees at the root of one biteperk.com deploy.
 *
 * Astro only base-prefixes its OWN managed assets + the sitemap. Every literal
 * URL the code writes — internal links, /og and /images assets, canonical, OG,
 * JSON-LD @id/url — must be routed through the helpers below (`u`, `abs`) so it
 * carries the locale base. The check-links gate fails the build if one escapes.
 */

export type BuildTarget = "au" | "global";

export type Locale = {
  /** URL base path under the origin, no trailing slash. e.g. "/au-en", "/en". */
  readonly base: string;
  /** `<html lang>` value for pages in this locale. */
  readonly lang: string;
  /** og:locale value (underscored), e.g. "en_AU". */
  readonly ogLocale: string;
  /** hreflang region codes this locale legitimately serves. */
  readonly hreflang: readonly string[];
  /** Human label for the region/language picker. */
  readonly label: string;
  /** The one x-default of the whole hreflang cluster. Exactly one locale sets this. */
  readonly xDefault?: boolean;
  /** The build target that emits this locale. */
  readonly target: BuildTarget;
};

/** The one origin every locale is served from. */
export const ORIGIN = "https://biteperk.com";

/** Canonical home of the Australian site — the entity anchor (stable everywhere). */
export const AU_BASE = "/au-en";
export const AU_HOME = `${ORIGIN}${AU_BASE}`;

/** The redirect-only country-code host (front door → AU_HOME). */
export const AU_CCTLD = "https://biteperk.com.au";

/**
 * The full locale cluster. Order matters only for display; the hreflang gate
 * asserts reciprocity + exactly one x-default regardless.
 */
export const locales: readonly Locale[] = [
  {
    base: "/au-en",
    lang: "en-AU",
    ogLocale: "en_AU",
    hreflang: ["en-AU"],
    label: "Australia — English",
    target: "au",
  },
  {
    base: "/en",
    lang: "en",
    ogLocale: "en",
    hreflang: ["en"],
    label: "International — English",
    xDefault: true,
    target: "global",
  },
  {
    base: "/fr",
    lang: "fr",
    ogLocale: "fr",
    hreflang: ["fr"],
    label: "International — Français",
    target: "global",
  },
];

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

/** Absolute home URL of a specific locale (origin + its base). */
export function localeHome(locale: Locale): string {
  return `${ORIGIN}${locale.base}`;
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
];

/**
 * THE LAUNCH FLAG (env-driven; default OFF). While off (the safe default):
 * /en + /fr stay `noindex` and NO cross-domain hreflang is emitted — output is
 * byte-identical to the pre-international-launch site. Launch in ONE deploy with
 *   INTL_LAUNCHED=true npm run build:site
 * which (a) makes /en + /fr indexable and (b) emits the reciprocal
 * au-en ↔ en ↔ fr hreflang cluster on shared pages. These must go live together
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
