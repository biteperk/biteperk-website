/**
 * Market city-page engine — the international counterpart of src/data/cities.ts.
 *
 * One entry per city per LOCALE TREE, keyed by `base`. Brussels appears twice
 * (be-en and be-fr) because those are two genuine translations; London appears
 * once. That asymmetry is the whole reason the flat page list in locales.ts was
 * replaced — see INTL_EXTRA_PAGES there.
 *
 * ── The hard rules, and why ──────────────────────────────────────────────────
 *
 * 1. NO geo, NO address, NO opening hours, NO phone. Deliberately absent from
 *    the type, not merely unused. The AU City carries them because Sydney is a
 *    real premises; BitePerk has no European premises, and inventing one is the
 *    fake-local-office failure PLAN.md §8 forbids. A market city page localises
 *    the CONVERSATION — the dining culture, the imagery, the spelling — and
 *    says plainly that Europe is the pilot programme.
 *
 * 2. Every text field is HAND-WRITTEN per city, and the anti-doorway gate
 *    (scripts/gates/check-cities.mjs) compares PER LANGUAGE ACROSS MARKETS, not
 *    per market. A London page and a Brussels-EN page are both English and both
 *    say "Vox is opening pilots here" — that pair is far likelier to read as
 *    templated than London vs. Paris, which the language boundary already
 *    separates. English: gb-en + be-en. French: fr + be-fr.
 *
 * 3. Two image slugs per city, not the AU engine's three: a cityscape unique to
 *    the city, plus a hospitality shot SHARED across the market (so `storyImage`
 *    repeating within a market is expected and fine). public/images is already
 *    74MB and binaries never delta-compress in git; a third unique slug per city
 *    would roughly treble the addition for no editorial gain.
 *
 * Empty until Phase 2. The mechanism and its gate ship first, deliberately: a
 * doorway-similarity gate you first exercise on 24 freshly-written pages is a
 * gate you will be tempted to loosen.
 */
import type { Lang } from "../locales";

export interface IntlCityFaq {
  readonly q: string;
  readonly a: string;
}

export interface IntlCityScenario {
  readonly title: string;
  readonly body: string;
}

/** "The AI under the hood, tuned for {City}" — hand-written per city. */
export interface IntlCityAiPoint {
  readonly icon: "pin" | "calendar-tick" | "phone-wave" | "shield";
  readonly title: string;
  readonly body: string;
}

export interface IntlCityAiLocal {
  readonly lead: string;
  readonly points: readonly IntlCityAiPoint[];
}

export interface IntlCity {
  /** URL segment within the locale tree: "/gb-en/london/" → "london". */
  readonly slug: string;
  /** Which locale tree emits it — a Locale.base, e.g. "/gb-en". */
  readonly base: string;
  /** The language this entry is written in; drives the similarity grouping. */
  readonly copyLang: Lang;
  readonly name: string;
  /** false until the copy passes check-cities.mjs. */
  readonly published: boolean;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroHeadline: string;
  /** Hand-written intro — this city's dining reality + the missed-call problem. */
  readonly intro: readonly string[];
  /** Districts/quarters, the local equivalent of the AU engine's suburbs. */
  readonly districts: readonly string[];
  readonly scenarios: readonly IntlCityScenario[];
  readonly faqs: readonly IntlCityFaq[];
  readonly aiLocal: IntlCityAiLocal;
  /** Slugs of guides in the SAME locale tree (Phase 3). */
  readonly relatedGuides: readonly string[];
  /** Iconic, signage-free establishing shot — unique per city. */
  readonly cityscapeImage: string;
  readonly cityscapeImageAlt: string;
  /** Hospitality scene — shared across the market (see rule 3 above). */
  readonly storyImage: string;
  readonly storyImageAlt: string;
}

export const intlCities: readonly IntlCity[] = [];

/** Published cities in one locale tree, in declaration order. */
export function intlCitiesForBase(base: string): readonly IntlCity[] {
  return intlCities.filter((c) => c.base === base && c.published);
}

/** Page paths ("london") a locale contributes from its published cities. */
export function intlCityPaths(base: string): readonly string[] {
  return intlCitiesForBase(base).map((c) => c.slug);
}
