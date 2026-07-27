/**
 * International copy resolution — language cores × market overrides.
 *
 * Layering model (single-domain matrix: /en /gb-en /fr /be-en /be-fr):
 *
 *   resolveCopy(locale) = merge( cores[locale.copyLang],           // copy.ts
 *                                marketContent[locale.base]?.copy ) // markets.ts
 *
 * The cores are complete per-language bundles; overrides are deep-partial
 * with ONE hard rule — arrays replace wholesale, never element-merge. An
 * override that touches `pilot.points` supplies the full new list; there is
 * no index-splicing and no stale trailing items. merge() is unit-tested in
 * tests/unit/intl-merge.test.mjs (run by gates:global).
 *
 * FRENCH REVIEW GATE — DISCHARGED 26 Jul 2026: the FR core, every fr-* market
 * override and the intl product copy had their native-speaker pass (Ludovic)
 * and are signed off, so this no longer blocks INTL_LAUNCHED. The rule still
 * stands for French ADDED after that date: it needs its own pass.
 *
 * The 27 Jul 2026 market-differentiation French (both FR home pages, both
 * about pages, two five-item FAQs) was reviewed and SIGNED OFF by Ludovic on
 * 27 Jul 2026 — DISCHARGED, cleared for prospect-facing use. The standing rule
 * is unchanged and applies to whatever is written next: French added after that
 * date needs its own native pass.
 */
import type { Lang, Locale } from "@/data/locales";
import {
  chrome, home, howItWorks, about, contact, privacy, terms, cookies,
  type ChromeCopy, type HomeCopy, type SimplePageCopy, type ContactCopy,
} from "./copy";
import { marketContent, type MarketContent, type MarketMedia, type MarketHero } from "./markets";

export type CopyBundle = {
  chrome: ChromeCopy;
  home: HomeCopy;
  howItWorks: SimplePageCopy;
  about: SimplePageCopy;
  contact: ContactCopy;
  privacy: SimplePageCopy;
  terms: SimplePageCopy;
  cookies: SimplePageCopy;
};

/**
 * Deep-partial where ARRAYS ARE REPLACED WHOLESALE (they behave like leaves).
 * Plain objects recurse; primitives replace.
 */
export type Override<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? Override<T[K]>
      : T[K];
};

const cores: Record<Lang, CopyBundle> = {
  en: {
    chrome: chrome.en, home: home.en, howItWorks: howItWorks.en,
    about: about.en, contact: contact.en, privacy: privacy.en, terms: terms.en,
    cookies: cookies.en,
  },
  fr: {
    chrome: chrome.fr, home: home.fr, howItWorks: howItWorks.fr,
    about: about.fr, contact: contact.fr, privacy: privacy.fr, terms: terms.fr,
    cookies: cookies.fr,
  },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Merge an override into a base: objects recurse, arrays/primitives replace. */
export function merge<T>(base: T, over: Override<T> | undefined): T {
  if (over === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(over)) return over as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) continue;
    const b = (base as Record<string, unknown>)[k];
    out[k] = isPlainObject(b) && isPlainObject(v) ? merge(b, v as Override<unknown>) : v;
  }
  return out as T;
}

/** The full copy bundle a locale renders (language core + market override). */
export function resolveCopy(locale: Locale): CopyBundle {
  return merge(cores[locale.copyLang], marketContent[locale.base]?.copy);
}

/** The locale's market-imagery band, if it has one (/en deliberately has none). */
export function resolveMedia(locale: Locale): MarketMedia | undefined {
  return marketContent[locale.base]?.media;
}

/**
 * The locale's hero image + honest market pill. Every global tree has one; the
 * signature stays optional so a new locale renders text-only (as all five did
 * before Jul 2026) rather than throwing on a missing image.
 */
export function resolveHero(locale: Locale): MarketHero | undefined {
  return marketContent[locale.base]?.hero;
}

export type { MarketContent, MarketMedia, MarketHero };
export type { ChromeCopy, HomeCopy, SimplePageCopy, ContactCopy, Lang };
