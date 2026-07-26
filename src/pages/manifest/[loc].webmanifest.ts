import type { APIRoute, GetStaticPaths } from "astro";
import { localesForTarget, currentTarget, ORIGIN, type Locale } from "@/data/locales";
import { resolveCopy } from "@/data/intl";
import { site } from "@/data/site";

/**
 * Web app manifest — ONE PER LOCALE.
 *
 * Why per locale and not a single file: `start_url` is where the installed
 * icon opens. A single manifest would send someone who installed from
 * /gb-en/ to the international home instead of their market — the whole point
 * of the locale trees. Emitting one per locale keeps the install honest.
 *
 * Lives under /manifest/ rather than at the root so it can use getStaticPaths
 * without colliding with the [...intl] catch-all.
 *
 * Deliberately NO service worker: this is a marketing site that ships several
 * times a week, and a stale cached shell is a worse failure than a network
 * round-trip. Installability + branding is the goal, offline is not.
 *
 * Icons come from `npm run brand` (maskable, safe-zone padded).
 */
export const getStaticPaths: GetStaticPaths = () =>
  localesForTarget(currentTarget()).map((l) => ({
    params: { loc: l.base.replace(/^\//, "") },
    props: { locale: l },
  }));

export const GET: APIRoute = ({ props }) => {
  const locale = props.locale as Locale;
  // AU keeps the site-wide description; the market trees use their own copy.
  const description =
    locale.target === "global" ? resolveCopy(locale).home.description : site.description;

  const manifest = {
    name: site.name,
    short_name: site.name,
    description,
    lang: locale.lang,
    dir: "ltr",
    start_url: `${locale.base}/`,
    // Scope is the locale tree: an installed UK app that wandered into /fr/
    // should hand off to the browser rather than pretend it's the same app.
    scope: `${locale.base}/`,
    id: `${ORIGIN}${locale.base}/`,
    display: "standalone",
    orientation: "any",
    // Matches the pre-paint theme default and the dark <meta name="theme-color">.
    theme_color: "#0a0b0d",
    background_color: "#0a0b0d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
};
