/**
 * Sticky-nav scroll listener.
 *
 * Toggles `.scrolled` on #nav once the page has scrolled past 12px,
 * so the nav can swap its backdrop to a solid-blurred state and add
 * its gold-tinted bottom border.
 *
 * Re-applies on `pageshow` (BFCache restore) and `astro:page-load`
 * (View Transitions) so the class is always correct.
 */

const SCROLL_THRESHOLD = 12;

function applyScrollState(): void {
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
}

let ticking = false;
function onScroll(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    applyScrollState();
    ticking = false;
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("pageshow", applyScrollState);
document.addEventListener("astro:page-load", applyScrollState);
applyScrollState();
