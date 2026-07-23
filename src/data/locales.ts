/**
 * Single source of truth for the site's locales and build targets.
 *
 * International site architecture — see
 * deliverables/2026-07-23-intl-site-architecture/PLAN.md.
 *
 * Consumed by:
 *   - astro.config.mjs        — host + sitemap per BUILD_TARGET (mirrors the
 *                               two host constants; config runs before the TS graph)
 *   - src/layouts/Base.astro  — <html lang> + the hreflang cluster (Phase 1)
 *   - scripts/check-*.mjs      — route/schema/hreflang gates, scoped per target
 *   - scripts/generate-og.mjs  — per-locale cards, per-host footer
 *
 * BUILD_TARGET selects which host + locale subset a build pass emits:
 *   au     → en-AU at the site root, on biteperk.com.au  (the existing shipped site)
 *   global → en (x-default) + fr, path-prefixed, on biteperk.com
 *
 * Nothing here alters the AU build's output: the `au` target reproduces the
 * pre-existing single-locale-at-root site exactly.
 */

export type BuildTarget = "au" | "global";

export type Locale = {
  /** URL path segment under the host. "" = served at the site root (AU). */
  readonly path: string;
  /** `<html lang>` value for pages in this locale. */
  readonly lang: string;
  /** hreflang region codes this locale legitimately serves. */
  readonly hreflang: readonly string[];
  /** Absolute origin this locale is served from. */
  readonly host: string;
  /** Human label for the region/language picker. */
  readonly label: string;
  /** The one x-default of the whole hreflang cluster. Exactly one locale sets this. */
  readonly xDefault?: boolean;
  /** True when this locale lives on a different host than the current build target. */
  readonly external?: boolean;
  /** The build target that emits this locale. */
  readonly target: BuildTarget;
};

export const AU_HOST = "https://biteperk.com.au";
export const GLOBAL_HOST = "https://biteperk.com";

/**
 * The full cross-domain cluster. `external` is relative to the *global* build;
 * Base.astro recomputes it per build target when it emits reciprocal hreflang.
 */
export const locales: readonly Locale[] = [
  {
    path: "en",
    lang: "en",
    hreflang: ["en", "en-US", "en-GB", "en-BE", "en-IE"],
    host: GLOBAL_HOST,
    label: "International — English",
    xDefault: true,
    target: "global",
  },
  {
    path: "fr",
    lang: "fr",
    hreflang: ["fr", "fr-FR", "fr-BE", "fr-LU"],
    host: GLOBAL_HOST,
    label: "France — Français",
    target: "global",
  },
  {
    path: "",
    lang: "en-AU",
    hreflang: ["en-AU"],
    host: AU_HOST,
    label: "Australia — English",
    external: true,
    target: "au",
  },
];

export const DEFAULT_TARGET: BuildTarget = "au";

/** Resolve a BUILD_TARGET env value, defaulting to `au`. */
export function resolveTarget(value?: string | null): BuildTarget {
  return value === "global" ? "global" : "au";
}

/** Absolute site origin Astro should build for a target. */
export function siteForTarget(target: BuildTarget): string {
  return target === "global" ? GLOBAL_HOST : AU_HOST;
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

/** The absolute host this build pass emits (biteperk.com.au or biteperk.com). */
export function currentHost(): string {
  return siteForTarget(currentTarget());
}

/** Locales emitted by a given build target. */
export function localesForTarget(target: BuildTarget): readonly Locale[] {
  return locales.filter((l) => l.target === target);
}

/**
 * Build the absolute URL for a page path within a locale.
 * `pagePath` is the page's path *within* the locale (e.g. "about/", "" for home).
 */
export function localeUrl(locale: Locale, pagePath = ""): string {
  const clean = pagePath.replace(/^\/+/, "");
  const prefix = locale.path ? `${locale.path}/` : "";
  return `${locale.host}/${prefix}${clean}`;
}

// ── International page scaffold (Phase 1) ────────────────────────────────────
export type Alternate = { readonly hreflang: string; readonly href: string };

/**
 * Pages emitted under every global locale (path within the locale; "" = home).
 * Phase-1 placeholders; Phase 2 replaces the content, keeping these routes.
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
 * The hreflang cluster for a page path across the global locales (en, fr).
 * Self-referencing + bidirectional + absolute + exactly one x-default —
 * everything check-hreflang.mjs asserts. The AU (en-AU) member joins only when
 * the international site goes live (both hosts serving reciprocal tags).
 */
export function buildGlobalHreflang(pagePath = ""): {
  alternates: Alternate[];
  xDefault: string;
} {
  const globals = localesForTarget("global");
  const alternates: Alternate[] = [];
  for (const l of globals) {
    const href = localeUrl(l, pagePath);
    for (const code of l.hreflang) alternates.push({ hreflang: code, href });
  }
  const x = globals.find((l) => l.xDefault) ?? globals[0];
  return { alternates, xDefault: localeUrl(x, pagePath) };
}

/** Expected `dir/index.html` routes for a build target (drives check-routes). */
export function pageRoutesForTarget(target: BuildTarget): string[] {
  if (target !== "global") return [];
  const out: string[] = [];
  for (const l of localesForTarget("global")) {
    for (const p of INTL_PAGE_PATHS) {
      const seg = [l.path, p].filter(Boolean).join("/");
      out.push(`${seg}/index.html`);
    }
  }
  return out;
}
