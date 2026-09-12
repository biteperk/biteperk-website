/**
 * Phase 1 locale plan — maps the product brief onto the LIVE locale SSOT.
 *
 * `src/data/locales.ts` remains the only emitter of real bases / hreflang /
 * build targets. This module is planning + readiness metadata so agents and
 * humans do not invent parallel path schemes (e.g. /uk-en, /fr-fr).
 *
 * Canada entries are RESERVED: they must not be added to `locales` until Wave 7
 * publish criteria are met (content + explicit publish flag).
 */

export type LocalePlanStatus = "live" | "reserved" | "future";

export type LocalePlanEntry = {
  /** Stable id used in Phase 1 docs and registries. */
  readonly id: string;
  /** Live URL base when status === "live"; planned base when reserved/future. */
  readonly base: string;
  readonly country: string;
  readonly language: string;
  readonly currency: string;
  /** E.164 country calling code prefix, informational only. */
  readonly phonePrefix: string;
  readonly status: LocalePlanStatus;
  /**
   * When status is live, the `locales.ts` base that must be used in code.
   * Brief aliases (uk-en, fr-fr) resolve here — never invent a second base.
   */
  readonly liveBase?: string;
  readonly notes?: string;
};

/**
 * Brief → live alias table. Import this instead of hardcoding /uk-en or /fr-fr.
 */
export const BRIEF_BASE_ALIASES: Readonly<Record<string, string>> = {
  "au-en": "/au-en",
  "uk-en": "/gb-en",
  "fr-fr": "/fr",
  "be-fr": "/be-fr",
  "be-en": "/be-en",
  en: "/en",
  "ca-en": "/ca-en",
  "ca-fr": "/ca-fr",
};

export const localePlan: readonly LocalePlanEntry[] = [
  {
    id: "au-en",
    base: "/au-en",
    liveBase: "/au-en",
    country: "Australia",
    language: "English",
    currency: "AUD",
    phonePrefix: "+61",
    status: "live",
    notes: "Master market. All Phase 1 templates perfect here first.",
  },
  {
    id: "en",
    base: "/en",
    liveBase: "/en",
    country: "International",
    language: "English",
    currency: "USD",
    phonePrefix: "",
    status: "live",
    notes: "x-default cluster member. Not in the brief’s short list — must stay.",
  },
  {
    id: "uk-en",
    base: "/gb-en",
    liveBase: "/gb-en",
    country: "United Kingdom",
    language: "English",
    currency: "GBP",
    phonePrefix: "+44",
    status: "live",
    notes: "Brief name uk-en; live base is /gb-en (do not rename).",
  },
  {
    id: "fr-fr",
    base: "/fr",
    liveBase: "/fr",
    country: "France",
    language: "French",
    currency: "EUR",
    phonePrefix: "+33",
    status: "live",
    notes: "Brief name fr-fr; live base is /fr (do not rename).",
  },
  {
    id: "be-en",
    base: "/be-en",
    liveBase: "/be-en",
    country: "Belgium",
    language: "English",
    currency: "EUR",
    phonePrefix: "+32",
    status: "live",
  },
  {
    id: "be-fr",
    base: "/be-fr",
    liveBase: "/be-fr",
    country: "Belgium",
    language: "French",
    currency: "EUR",
    phonePrefix: "+32",
    status: "live",
  },
  {
    id: "ca-en",
    base: "/ca-en",
    country: "Canada",
    language: "English",
    currency: "CAD",
    phonePrefix: "+1",
    status: "reserved",
    notes: "Ontario, British Columbia, Alberta focus. Config-only until Wave 7.",
  },
  {
    id: "ca-fr",
    base: "/ca-fr",
    country: "Canada",
    language: "French",
    currency: "CAD",
    phonePrefix: "+1",
    status: "reserved",
    notes: "Montréal, Québec City, Laval, Longueuil focus. Config-only until Wave 7.",
  },
] as const;

export function resolveBriefBase(briefOrBase: string): string {
  const key = briefOrBase.replace(/^\//, "");
  return BRIEF_BASE_ALIASES[key] ?? (briefOrBase.startsWith("/") ? briefOrBase : `/${briefOrBase}`);
}

export function liveLocalePlan(): readonly LocalePlanEntry[] {
  return localePlan.filter((e) => e.status === "live");
}

export function reservedLocalePlan(): readonly LocalePlanEntry[] {
  return localePlan.filter((e) => e.status === "reserved");
}
