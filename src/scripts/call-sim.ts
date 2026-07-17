/**
 * Call-simulation playback (pairs with CallSim.astro).
 *
 * The transcript ships fully visible in the DOM. When the card scrolls
 * into view — and only when motion is allowed — this script "arms" the
 * card (hiding the lines via CSS) and replays them on a timed schedule:
 * caller lines pop in after a beat, Bella lines show a typing indicator
 * first. Under prefers-reduced-motion the card is never armed, so the
 * full transcript simply stays put.
 *
 * Same lifecycle pattern as reveal.ts: runs once now, re-runs on
 * `astro:page-load` for View Transitions, idempotent per element.
 */

function initCallSim(): void {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll<HTMLElement>("[data-call-sim]").forEach((sim) => {
    if (sim.dataset.csBound) return;
    sim.dataset.csBound = "1";
    if (reduce) return;

    const lines = Array.from(sim.querySelectorAll<HTMLElement>("[data-cs-line]"));
    if (lines.length === 0) return;
    let timers: number[] = [];

    const play = (): void => {
      timers.forEach((t) => clearTimeout(t));
      timers = [];
      sim.setAttribute("data-armed", "");
      lines.forEach((l) => {
        l.classList.remove("is-in");
        l.removeAttribute("data-typing");
      });
      // Beat of silence, then walk the transcript.
      let t = 500;
      for (const line of lines) {
        const isBella = line.dataset.role === "bella";
        if (isBella) {
          timers.push(window.setTimeout(() => line.setAttribute("data-typing", ""), t));
          t += 850;
        }
        timers.push(
          window.setTimeout(() => {
            line.removeAttribute("data-typing");
            line.classList.add("is-in");
          }, t)
        );
        t += isBella ? 1100 : 900;
      }
    };

    sim.querySelector<HTMLButtonElement>("[data-cs-replay]")?.addEventListener("click", play);

    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            io.disconnect();
            play();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(sim);
  });
}

initCallSim();
document.addEventListener("astro:page-load", initCallSim);
