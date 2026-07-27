/**
 * PRODUCT_SLUGS SSOT gate (B7).
 *
 * The contact Cloud Function keeps an allowlist of accepted `product` values
 * (`PRODUCT_SLUGS` in functions/index.js) and silently coerces anything else
 * to "". That coercion is the right behaviour for junk input, but it means a
 * slug the SITE can legitimately submit and the FUNCTION doesn't know about
 * fails invisibly: the form still returns {"ok":true}, the lead is still
 * written, and only the product attribution quietly disappears. Nothing in
 * the repo caught that, so it could only ever be found by noticing months of
 * leads with a blank product.
 *
 * This gate closes it from the built output rather than from a hand-kept
 * list: it reads every `product` field the built HTML can post — hidden
 * inputs and <select> options, across BOTH build targets — and asserts the
 * function accepts each one.
 *
 * Deliberately a SUBSET check, not equality. PRODUCT_SLUGS also carries the
 * legacy `voco*` and `perk*` slugs, which no longer appear anywhere on the
 * site and must stay accepted forever — printed collateral and cached links
 * still post them (see CLAUDE.md, "Legacy slugs").
 *
 * Run: node scripts/gates/check-product-slugs.mjs   (after a build)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { globSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The allowlist the deployed function actually enforces. */
function functionSlugs() {
  const src = readFileSync(join(ROOT, "functions/index.js"), "utf8");
  const m = src.match(/const PRODUCT_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
  if (!m) {
    console.error("check-product-slugs: could not find PRODUCT_SLUGS in functions/index.js.");
    console.error("  If it was renamed or restructured, update this gate — do not delete it.");
    process.exit(1);
  }
  return new Set([...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]));
}

/** Every `product` value the built HTML can submit, with the page that does it. */
function submittedSlugs(dirs) {
  const found = new Map(); // slug -> first file that offers it
  for (const dir of dirs) {
    const root = join(ROOT, dir);
    if (!existsSync(root)) continue;
    for (const file of globSync("**/*.html", { cwd: root })) {
      const html = readFileSync(join(root, file), "utf8");

      // Hidden/text inputs: name and value in either order.
      for (const tag of html.match(/<input\b[^>]*>/g) ?? []) {
        if (!/name="product"/.test(tag)) continue;
        const v = tag.match(/value="([^"]*)"/);
        if (v) found.set(v[1], found.get(v[1]) ?? `${dir}/${file}`);
      }

      // <select name="product"> — every option is submittable.
      for (const sel of html.matchAll(/<select\b[^>]*name="product"[^>]*>([\s\S]*?)<\/select>/g)) {
        for (const o of sel[1].matchAll(/value="([^"]*)"/g)) {
          found.set(o[1], found.get(o[1]) ?? `${dir}/${file}`);
        }
      }
    }
  }
  return found;
}

const allowed = functionSlugs();
const submitted = submittedSlugs(["dist", "dist-global"]);

if (submitted.size === 0) {
  console.error(
    "check-product-slugs: found no product field in dist/ or dist-global/. " +
      "Either the build is missing (run it first) or the contact form lost its " +
      "product field — both are worth failing on.",
  );
  process.exit(1);
}

const orphans = [...submitted].filter(([slug]) => !allowed.has(slug));
if (orphans.length) {
  console.error("check-product-slugs: the site can submit product values the function rejects.\n");
  for (const [slug, where] of orphans) {
    console.error(`  ${JSON.stringify(slug)}  offered by ${where}`);
  }
  console.error(
    "\nThe function coerces these to \"\" and still returns ok, so the lead is saved " +
      "with NO product attribution and nothing surfaces the loss.\n" +
      "Fix: add the slug to PRODUCT_SLUGS in functions/index.js, then deploy the " +
      "function BEFORE the hosting change (functions first — see CLAUDE.md, Deploy).",
  );
  process.exit(1);
}

const legacy = [...allowed].filter((s) => s && !submitted.has(s));
console.log(
  `check-product-slugs: OK — all ${submitted.size} submittable product value(s) are accepted ` +
    `(${[...submitted.keys()].filter(Boolean).sort().join(", ")}); ` +
    `${legacy.length} legacy slug(s) retained for cached links.`,
);
