/**
 * Pointer-tracking card glow (pairs with the [data-glow] CSS in
 * global.css). One delegated, rAF-throttled pointermove listener writes
 * --mx/--my onto the closest [data-glow] card so its gold radial
 * follows the cursor.
 *
 * Skips entirely on coarse pointers (no hover) and under
 * prefers-reduced-motion. Bound once per full page load — document-level
 * delegation survives View Transition DOM swaps.
 */

let raf = 0;

function onMove(e: PointerEvent): void {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const card = (e.target as Element | null)?.closest?.("[data-glow]");
    if (!(card instanceof HTMLElement)) return;
    const r = card.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    card.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`);
    card.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`);
  });
}

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
if (!reduce && !coarse) {
  document.addEventListener("pointermove", onMove, { passive: true });
}
