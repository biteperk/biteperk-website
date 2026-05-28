/**
 * Number counter for MetricStat.
 *
 * Markup contract:
 *   <span data-counter data-counter-to="1248" data-counter-format="number"
 *         data-counter-duration="1200">0</span>
 *
 * Animates from 0 to the target value when the element intersects the
 * viewport (single-fire). Honours prefers-reduced-motion by snapping
 * straight to the final value.
 *
 * Supported formats: `number` (default), `percent`, `time-ms` (renders
 * as "1.2s"), `plain` (suffix-only — caller supplies a sibling unit).
 */

type Format = "number" | "percent" | "time-ms" | "plain";

function format(value: number, fmt: Format): string {
  switch (fmt) {
    case "percent":
      return `${Math.round(value)}%`;
    case "time-ms":
      return `${(value / 1000).toFixed(1)}s`;
    case "plain":
    case "number":
    default:
      return Math.round(value).toLocaleString("en-AU");
  }
}

function animate(el: HTMLElement): void {
  const to = Number(el.dataset.counterTo);
  if (!Number.isFinite(to)) return;
  const fmt = (el.dataset.counterFormat as Format) ?? "number";
  const dur = Number(el.dataset.counterDuration ?? "1200");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || dur <= 0) {
    el.textContent = format(to, fmt);
    return;
  }
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(to * eased, fmt);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function init(): void {
  const els = document.querySelectorAll<HTMLElement>("[data-counter]");
  if (els.length === 0) return;
  // Render resting value immediately so there's never a flash of "0".
  els.forEach((el) => {
    if (!el.textContent || el.textContent === "0") {
      const to = Number(el.dataset.counterTo);
      const fmt = (el.dataset.counterFormat as Format) ?? "number";
      if (Number.isFinite(to)) el.textContent = format(0, fmt);
    }
  });
  if (!("IntersectionObserver" in window)) {
    els.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animate(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.35 }
  );
  els.forEach((el) => io.observe(el));
}

init();
document.addEventListener("astro:page-load", init);
