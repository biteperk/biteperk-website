# BitePerk v2 — Art direction & AI imagery pipeline

## Brand image story

Photorealistic Australian hospitality, shot like an editorial food-magazine feature:
warm tungsten interiors, late-afternoon window light, shallow depth of field, honest
mid-service energy. Never sterile stock, never sci-fi "AI" clichés (no robots, no
glowing circuits, no floating holograms).

**Colour story (enforced in post, not prompts):** deep charcoal shadows, warm amber
highlights keyed to brand gold #f5c418, muted greens in plants/bottles echoing brand
green. One neutral grade must sit well on both the dark (#0a0b0d) and light (#faf9f6)
themes — grade to a balanced midpoint, slightly warm, lifted blacks (~5%), soft
highlight rolloff.

## Hard rules (every image, no exceptions)

1. **No readable signage, menus, logos, or text** — AI text artifacts are the #1
   credibility killer. Prompt "no visible text" and crop/retouch any that appears.
2. **No identifiable faces.** Subjects turned away, motion-blurred, cropped, or
   defocused. We must never imply real staff/customers who don't exist.
3. **No fake identifiable venues or landmarks presented as customers.** Skyline/harbour
   establishing shots are fine; a "restaurant" implied to be a real client is not.
4. **Hands minimal or hidden** (hold a phone at edge of frame, rest on a counter).
   Reject any image with anatomical artifacts.
5. Every image is human-reviewed before use — `reviewed: true` in the manifest is
   required or the build fails.

## Base prompt template

> Photorealistic editorial photograph, Australian [SCENE], warm tungsten and
> late-afternoon window light, shallow depth of field, 35mm lens, natural film grain,
> muted warm palette with charcoal shadows and amber highlights, no visible text or
> signage, no identifiable faces, high dynamic range, magazine quality

Aspect ratios: hero 16:9 at ≥2560px wide; card/section 4:3 at ≥1920px; OG source 1.91:1.

## Slot library

| Slot | Scene prompt fragment |
|---|---|
| `hero-home` | busy small restaurant interior mid-service, phone handset on timber bar in foreground, warm bokeh of diners behind |
| `hero-products` | close crop of a restaurant host stand with phone and reservation book, evening service glow |
| `city-sydney` | harbourside laneway bistro at dusk, sandstone texture, Sydney golden light |
| `city-melbourne` | narrow laneway cafe with dark timber and brass, moody overcast daylight, espresso bar |
| `city-brisbane` | open-air riverside deck dining, subtropical greenery, humid golden hour |
| `city-perth` | coastal-light beach-suburb restaurant, white walls, Indian Ocean afternoon glare through windows |
| `city-adelaide` | heritage stone building wine bar interior, bottles and dark shelving, intimate lamplight |
| `city-gold-coast` | breezy surf-club style bistro, pale timber, ocean light, ceiling fans |
| `contact` | quiet restaurant before service, chairs down, morning light, phone on counter |
| `blog-default` | overhead of a cafe table with notebook, coffee, phone |

Per-city cues stay environmental (light, materials, vegetation, mood) — never a
recognisable specific venue.

## Workflow

1. Generate externally (Midjourney / Imagen / gpt-image) with the template + slot fragment.
2. Review against the hard rules; discard failures.
3. Drop the master as `scripts/img/intake/<slot>.png` (largest available).
4. Run `npm run images:v2` → `scripts/img/process.mjs`:
   - applies the neutral brand grade (adapted from scripts/grade.mjs)
   - emits AVIF/WebP/JPG at 768/1280/1920 into `public/images/v2/`
   - writes LQIP + intrinsic dimensions + `reviewed: false` into
     `src/data/image-manifest.json`
5. Flip `reviewed: true` in the manifest after a final on-page check. The build
   check (scripts/check-images.mjs) fails if a referenced slot is unreviewed.
6. OG cards: `npm run og` (satori template) — per-page + per-city.
