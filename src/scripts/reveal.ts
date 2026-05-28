/**
 * Scroll-reveal hook.
 *
 * Adds `.is-in` to every element marked `.reveal` once it crosses the
 * viewport. Single-fire — the observer disconnects after each match so
 * a section never re-animates.
 *
 * Re-runs on `astro:page-load` so View Transitions also reveal new
 * sections after a soft navigation.
 *
 * Short-circuits under `prefers-reduced-motion: reduce` (CSS in
 * global.css already makes the resting state visible, but skipping
 * observer work is cheaper).
 */

function applyReveal(): void {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll<HTMLElement>(".reveal");
  if (els.length === 0) return;
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

applyReveal();
document.addEventListener("astro:page-load", applyReveal);
