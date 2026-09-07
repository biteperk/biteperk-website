/**
 * Image fade-in.
 *
 * ImageBlock paints an LQIP blur behind every photo and declares
 * `transition: opacity` on the <img>, but nothing toggled it — the full
 * image hard-swapped over the blur. This wires the missing half: below-the-
 * fold catalogue images (marked `data-fade` by ImageBlock — eager and
 * deprioritized heroes are excluded so LCP is untouched) start hidden (CSS,
 * gated on `html.js`) and fade to `opacity:1` once they decode.
 *
 * Robustness:
 *   - `img.complete` (cached / already-loaded) → reveal immediately, so an
 *     image can never be stranded invisible.
 *   - `error` (404 / decode failure) → reveal too, rather than leaving a blank.
 *   - `:not(.is-loaded)` → idempotent across the `astro:page-load` re-run that
 *     View Transitions need for soft navigations.
 *   - No JS → no `.js` class → CSS leaves images fully visible.
 */

function wire(root: ParentNode = document): void {
  if (typeof document === "undefined") return;
  root.querySelectorAll<HTMLImageElement>("img[data-fade]:not(.is-loaded)").forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("is-loaded");
      return;
    }
    const done = (): void => {
      img.classList.add("is-loaded");
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
    };
    img.addEventListener("load", done);
    img.addEventListener("error", done);
  });
}

wire();
document.addEventListener("astro:page-load", () => wire());
