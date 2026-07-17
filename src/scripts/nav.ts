/**
 * Sticky-nav scroll listener + active-link re-sync.
 *
 * Toggles `.scrolled` on #nav once the page has scrolled past 12px,
 * so the nav can swap its backdrop to a solid-blurred state and add
 * its gold-tinted bottom border.
 *
 * Active-link re-sync: the nav is `transition:persist`ed across View
 * Transitions, so its server-rendered `.active`/`aria-current` would
 * otherwise point at the PREVIOUS page after a soft navigation. On
 * every `astro:page-load` we re-derive the state from
 * `location.pathname` — links carry `data-nav-link` (their href; hash
 * links are excluded and never active, matching isNavActive in
 * data/nav.ts) and the megamenu trigger carries
 * `data-nav-active-prefix`.
 *
 * Re-applies on `pageshow` (BFCache restore) and `astro:page-load`
 * (View Transitions) so both states are always correct.
 */

const SCROLL_THRESHOLD = 12;

function applyActiveState(): void {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  nav.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((a) => {
    const target = (a.dataset.navLink ?? "").replace(/\/$/, "") || "/";
    const active = path === target || path.startsWith(target + "/");
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  nav.querySelectorAll<HTMLElement>("[data-nav-active-prefix]").forEach((el) => {
    const prefix = (el.dataset.navActivePrefix ?? "").replace(/\/$/, "");
    el.classList.toggle("active", path === prefix || path.startsWith(prefix + "/"));
  });
}

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
document.addEventListener("astro:page-load", () => {
  applyScrollState();
  applyActiveState();
});
applyScrollState();
applyActiveState();
