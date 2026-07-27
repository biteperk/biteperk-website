/**
 * Similarity primitives, shared by check-cities.mjs and check-intl-similarity.mjs.
 *
 * Extracted so the two gates cannot drift on method. Both must agree on the
 * shingle width and — importantly — on the denominator: this is CONTAINMENT
 * (hits / min(|a|,|b|)), not Jaccard. That choice matters when reasoning about
 * how to pass the gate: adding unique text to only ONE side barely moves the
 * number, because the smaller set stays contained. Both sides have to grow.
 *
 * The Latin-1 supplement range in `words()` is load-bearing — stripping it
 * would erase every accent and make French copy look far more similar to
 * itself than it is.
 *
 * That is not hypothetical. Until Jul 2026 this module was imported by
 * check-intl-similarity only: check-cities kept its own copy, under a comment
 * claiming the two could not drift, and it had already drifted into exactly the
 * tokenizer warned about above — no `À-ɏ`, and punctuation DELETED rather than
 * replaced with a space, so `l'équipe` → `lquipe` and `don't` → `dont`. Both
 * gates now import from here. Verify that by editing something in this file
 * (the shingle width is easiest) and confirming BOTH gates' numbers move; an
 * accent-only change proves nothing, because the AU cities are English.
 */

/** Lowercase, drop punctuation, keep accented Latin letters, split on space. */
export const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9À-ɏ\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Set of overlapping n-word shingles (default 4, matching check-cities). */
export const shingles = (s, n = 4) => {
  const w = words(s);
  const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(" "));
  return set;
};

/** Containment: hits / min(|a|,|b|). Deliberately not Jaccard — see header. */
export const overlap = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const s of a) if (b.has(s)) hit++;
  return hit / Math.min(a.size, b.size);
};

/**
 * Visible prose from a built HTML page, with everything that is CHROME removed.
 *
 * The consent block is the one that matters and the one that is easy to miss:
 * `<aside class="consent-root">` carries ~130 words of banner + cookie-settings
 * modal, identical on every page in a language, and it sits outside <header>,
 * <footer> and <nav>. On a ~360-word /about/ page that is ~36% of the text, so
 * leaving it in makes five genuinely different pages look ~46% alike and the
 * gate measures its own boilerplate. This was measured, not guessed.
 */
export const visibleText = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<header[\s\S]*?<\/header>/g, " ")
    .replace(/<footer[\s\S]*?<\/footer>/g, " ")
    .replace(/<nav[\s\S]*?<\/nav>/g, " ")
    .replace(/<aside class="consent-root"[\s\S]*?<\/aside>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
