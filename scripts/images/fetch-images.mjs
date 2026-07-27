/**
 * Photo fetch.
 *
 * Pulls curated Unsplash photos for the Biteperk site. Each photo is
 * keyed by `slug` (filename) and an Unsplash photo ID. We hit the
 * `images.unsplash.com` CDN directly with width + quality params, so
 * no Unsplash API key is needed.
 *
 * Idempotent: a photo that already exists in public/images/raw/ is
 * skipped. Re-run to refresh after changing the catalogue.
 *
 * License note: Unsplash is free for commercial and non-commercial use.
 * We attribute photographers in public/images/CREDITS.txt anyway.
 *
 * Usage: node scripts/images/fetch-images.mjs
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const RAW = join(ROOT, "public", "images", "raw");
const CREDITS = join(ROOT, "public", "images", "CREDITS.txt");

if (!existsSync(RAW)) mkdirSync(RAW, { recursive: true });

// Curated Unsplash photos. Each entry: slug, photoId, photographer, photographerUrl, brief.
// IDs verified against Unsplash hot-link CDN — these are stable, long-lived photos.
const catalogue = [
  {
    slug: "restaurant-evening",
    id: "photo-1517248135467-4c7edcad34c4",
    photographer: "Patrick Tomasso",
    url: "https://unsplash.com/photos/Oaqk7qqNh_c",
    brief: "Dim restaurant interior, candlelit tables",
  },
  {
    slug: "sydney-harbour-dusk",
    id: "photo-1523428096881-5bd79d043006",
    photographer: "Dan Freeman",
    url: "https://unsplash.com/photos/SzWBPqg6Vss",
    brief: "Sydney Opera House and harbour bridge — the iconic frame",
  },
  {
    slug: "phone-on-bar",
    id: "photo-1556656793-08538906a9f8",
    photographer: "Jonas Leupe",
    url: "https://unsplash.com/photos/Em9SauavhKE",
    brief: "Mobile phone on a wooden bar counter",
  },
  {
    slug: "hands-headset",
    id: "photo-1521737604893-d14cc237f11d",
    photographer: "Mimi Thian",
    url: "https://unsplash.com/photos/ZKBzlifgkgw",
    brief: "Hands adjusting a headset, low key",
  },
  {
    slug: "reservation-book",
    id: "photo-1455390582262-044cdead277a",
    photographer: "Aaron Burden",
    url: "https://unsplash.com/photos/y02jEX_B0O0",
    brief: "Open notebook with pen, paper texture",
  },
  {
    slug: "restaurant-pass",
    id: "photo-1414235077428-338989a2e8c0",
    photographer: "Jay Wennington",
    url: "https://unsplash.com/photos/N_Y88TWmGwA",
    brief: "Kitchen pass with prepared dish",
  },
  {
    slug: "restaurant-host",
    id: "photo-1559339352-11d035aa65de",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/qREZGOkkOdY",
    brief: "Front-of-house host scene",
  },
  {
    slug: "kitchen-rush",
    id: "photo-1556910103-1c02745aae4d",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/dxIuhpkdHHM",
    brief: "Busy kitchen service moment",
  },
  {
    slug: "coffee-window",
    id: "photo-1554118811-1e0d58224f24",
    photographer: "Toa Heftiba",
    url: "https://unsplash.com/photos/rb-WrM5_3a4",
    brief: "Coffee shop service window with morning light",
  },
  {
    slug: "sydney-cafe-morning",
    id: "photo-1453614512568-c4024d13c247",
    photographer: "Brooke Cagle",
    url: "https://unsplash.com/photos/uxXHfTrAU0o",
    brief: "Café interior, morning amber light",
  },
  {
    slug: "pour-shot",
    id: "photo-1510812431401-41d2bd2722f3",
    photographer: "Mae Mu",
    url: "https://unsplash.com/photos/yA-OOaENvxg",
    brief: "Drink pour, low-key dramatic light",
  },
  {
    slug: "empty-tables-evening",
    id: "photo-1552566626-52f8b828add9",
    photographer: "Stefan Johnson",
    url: "https://unsplash.com/photos/-pwT7nz1Lec",
    brief: "Empty restaurant tables, dim warm light",
  },
  {
    slug: "pizza-pass",
    id: "photo-1565299624946-b28f40a0ae38",
    photographer: "Aurélien Lemasson-Théobald",
    url: "https://unsplash.com/photos/m5GiI16fxlw",
    brief: "Pizza emerging on a pass",
  },
  {
    slug: "sydney-skyline-night",
    id: "photo-1523428096881-5bd79d043006",
    photographer: "Dan Freeman",
    url: "https://unsplash.com/photos/SzWBPqg6Vss",
    brief: "Sydney skyline at night with harbour reflection",
  },
  {
    slug: "busy-service-night",
    id: "photo-1559339352-11d035aa65de",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/qREZGOkkOdY",
    brief: "Full restaurant during service, candle-lit, busy tables",
  },
  {
    slug: "sydney-cafe-street",
    id: "photo-1521017432531-fbd92d768814",
    photographer: "Toa Heftiba",
    url: "https://unsplash.com/photos/4xe-yVFJCvw",
    brief: "Café street view, awning + signage, golden hour",
  },
  {
    slug: "bar-cocktail-action",
    id: "photo-1514362545857-3bc16c4c7d1b",
    photographer: "Edward Howell",
    url: "https://unsplash.com/photos/u3WmDyKGsrY",
    brief: "Cocktail pour in a low-lit bar, hand visible",
  },
  {
    slug: "table-set-candles",
    id: "photo-1424847651672-bf20a4b0982b",
    photographer: "Rod Long",
    url: "https://unsplash.com/photos/oZsP-od1jOM",
    brief: "Close-up of a set restaurant table with candles + cutlery",
  },
  {
    slug: "staff-hands-tray",
    id: "photo-1559925393-8be0ec4767c8",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/7QChbqDes6w",
    brief: "Hands of service staff carrying a tray",
  },
  // ── City establishing shots (landscape) — one iconic, signage-free
  //    landmark per published city. Used as the /[city]/ cityscape band.
  //    Sydney reuses sydney-harbour-dusk above. IDs HEAD-verified against
  //    the CDN transform (recent uploads can 404; these are 200).
  {
    slug: "melbourne-skyline",
    id: "photo-1573639571368-065819727a52",
    photographer: "Ayush Jain",
    url: "https://unsplash.com/photos/city-during-day-6DiTXhlRE70",
    brief: "Melbourne CBD skyline across the Yarra River, daytime",
  },
  {
    slug: "brisbane-river",
    id: "photo-1571384192873-ad1703337b32",
    photographer: "Jesse Collins",
    url: "https://unsplash.com/photos/birds-eye-view-photo-of-a-country-kfqZbKHV8dQ",
    brief: "Brisbane city skyline at dusk above the river",
  },
  {
    slug: "perth-city",
    id: "photo-1662672764495-1f048fe7f65f",
    photographer: "Eddie Mark Blair",
    url: "https://unsplash.com/photos/a-city-skyline-at-night-XU3sz-IJANk",
    brief: "Perth skyline reflected in the Swan River at dusk",
  },
  {
    slug: "adelaide-city",
    id: "photo-1676878791571-72a8b48fcc97",
    photographer: "Athithan Vignakaran",
    url: "https://unsplash.com/photos/a-view-of-a-city-from-the-top-of-a-hill-qhE2ya9vv2M",
    brief: "Adelaide from the hills, the city stretching to the gulf",
  },
  {
    slug: "gold-coast-skyline",
    id: "photo-1582761370596-77a6a42350d7",
    photographer: "City of Gold Coast",
    url: "https://unsplash.com/photos/city-skyline-near-body-of-water-during-daytime-o5TTYcAlbHc",
    brief: "Gold Coast skyline along the beach at Surfers Paradise",
  },

  // ── International market bands (/gb-en, /fr, /be-en, /be-fr) ──────
  // Every ID HEAD-verified against the CDN and pixel-reviewed against the
  // art-direction hard rules (no readable signage, no identifiable faces, no
  // implied fake customer venues) before being added — 24 Jul 2026.
  // "Unsplash contributor": the CDN asset carries no author metadata; backfill
  // the name from the photo page if it's ever identified. Unsplash's license
  // doesn't require attribution — this file records it as a courtesy.
  {
    slug: "london-skyline",
    id: "photo-1513635269975-59663e0ac1ad",
    photographer: "Benjamin Davies",
    url: "https://unsplash.com/photos/Oja2ty_9ZLM",
    brief: "Aerial London — Tower Bridge and the Thames toward the City",
  },
  {
    slug: "bar-moody",
    id: "photo-1514933651103-005eec06c04b",
    photographer: "Unsplash contributor",
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
    brief: "Moody bar counter before service — no people, location-neutral",
  },
  {
    slug: "paris-skyline",
    id: "photo-1502602898657-3e91760cbb34",
    photographer: "Chris Karidis",
    url: "https://unsplash.com/photos/nnzkZNYWHaU",
    brief: "Eiffel Tower over the Seine at dusk",
  },
  {
    slug: "paris-street",
    id: "photo-1549144511-f099e773c147",
    photographer: "Unsplash contributor",
    url: "https://images.unsplash.com/photo-1549144511-f099e773c147",
    brief: "Cobbled Paris street beneath the Eiffel Tower",
  },
  {
    slug: "belgium-dinant",
    id: "photo-1491557345352-5929e343eb89",
    photographer: "Unsplash contributor",
    url: "https://images.unsplash.com/photo-1491557345352-5929e343eb89",
    brief: "Dinant on the Meuse — riverside townhouses, Belgium",
  },
  {
    slug: "cafe-continental",
    id: "photo-1554118811-1e0d58224f24",
    photographer: "Unsplash contributor",
    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
    brief: "Relaxed continental café interior — one guest, back turned",
  },

  // ── Market heroes + Brussels (regional parity, Jul 2026) ──────────────
  // One hero per global tree so the five markets are visually distinct rather
  // than sharing a look: amber bar (UK) / blue banquette (BE) / red velvet (FR)
  // / light wood (the neutral x-default). Note the AU hero (table-set-candles)
  // is itself geography-neutral — localness comes from the pill and copy, not
  // from the hero photo — so these follow the same rule.
  // Every one was reviewed at full size against docs/art-direction.md: no
  // readable signage/menus/logos, no identifiable faces, no venue presented as
  // a customer. Three earlier candidates were rejected on exactly those rules
  // (readable snack branding, people in frame, a church, and Venice).
  {
    slug: "brussels-grand-place",
    id: "photo-1548092304-e0205cb0031b",
    photographer: "Stephanie LeBlanc",
    url: "https://unsplash.com/@sleblanc01",
    brief:
      "Brussels Grand-Place guild houses against a dramatic sky — the Belgian " +
      "establishing shot. Replaces belgium-dinant, a town 90 min away that stood " +
      "in while every Belgian string said Brussels.",
  },
  {
    slug: "pub-amber-evening",
    id: "photo-1763142045723-230b56924c6a",
    photographer: "Robert",
    url: "https://unsplash.com/@robert_lens",
    brief: "Amber-lit bar before service — bentwood chairs up, patterned tile, no people (UK hero)",
  },
  {
    slug: "brasserie-banquette",
    id: "photo-1583354608715-177553a4035e",
    photographer: "Klara Kulikova",
    url: "https://unsplash.com/@kkalerry",
    brief: "Blue velvet banquette and marble tables laid for service, no people (Belgium hero)",
  },
  {
    slug: "bistro-red-velvet",
    id: "photo-1686836715835-65af22ea5cd4",
    photographer: "Darrell Jonathan",
    url: "https://unsplash.com/@d29h45",
    brief: "Dim bistro dining room — red walls, wall sconces, table set by the window (France hero)",
  },
  {
    slug: "table-set-neutral",
    id: "photo-1602232037779-30b01ac3c457",
    photographer: "Alessio Dandi",
    url: "https://unsplash.com/@alessiodandi",
    brief:
      "Laid tables in warm light, dried flowers, no people — deliberately reads " +
      "as neither European nor Australian, for the /en x-default tree",
  },
];

const FETCH_W = 2000;
const FETCH_Q = 85;

async function fetchOne(entry) {
  const out = join(RAW, `${entry.slug}.jpg`);
  if (existsSync(out)) {
    console.log(`· ${entry.slug} (cached)`);
    return { ...entry, status: "cached" };
  }
  const url = `https://images.unsplash.com/${entry.id}?w=${FETCH_W}&q=${FETCH_Q}&fm=jpg&fit=max&auto=format`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "biteperk-website/fetch-images (https://biteperk.com.au)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(out, buf);
    const kb = Math.round(buf.length / 1024);
    console.log(`✓ ${entry.slug} (${kb} KB)`);
    return { ...entry, status: "fetched" };
  } catch (err) {
    console.error(`✗ ${entry.slug}: ${err.message}`);
    return { ...entry, status: "failed", error: err.message };
  }
}

console.log(`→ fetching ${catalogue.length} photos from Unsplash CDN…\n`);

const results = [];
for (const entry of catalogue) {
  results.push(await fetchOne(entry));
}

const ok = results.filter((r) => r.status !== "failed");
const failed = results.filter((r) => r.status === "failed");

// ── Credits file ───────────────────────────────────────────────────
const creditLines = [
  "Biteperk photo credits",
  "=====================",
  "",
  "All photos sourced under the Unsplash License (https://unsplash.com/license).",
  "Photos have been colour-graded for site consistency. Originals are at the",
  "URLs below.",
  "",
];
for (const r of ok) {
  creditLines.push(`${r.slug}`);
  creditLines.push(`  Photographer: ${r.photographer}`);
  creditLines.push(`  Original:     ${r.url}`);
  creditLines.push(`  Brief:        ${r.brief}`);
  creditLines.push("");
}
writeFileSync(CREDITS, creditLines.join("\n"));

console.log("");
console.log(`fetched: ${results.filter((r) => r.status === "fetched").length}`);
console.log(`cached:  ${results.filter((r) => r.status === "cached").length}`);
console.log(`failed:  ${failed.length}`);
if (failed.length > 0) {
  console.error("\nFailed fetches:");
  failed.forEach((f) => console.error(`  ${f.slug} → ${f.error}`));
  process.exitCode = 1;
}
