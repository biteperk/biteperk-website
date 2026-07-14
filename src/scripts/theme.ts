/**
 * Theme toggle behaviour. The *initial* theme is applied pre-paint by the
 * inline script in Base.astro; this module only wires the toggle buttons
 * and keeps everything in sync across View Transitions + OS changes.
 *
 * Storage contract (shared with the inline script):
 *   localStorage["bp-theme"] = "light" | "dark"  (absent = follow system)
 * Toggle cycles: system-resolved value → opposite → back, always writing an
 * explicit value (simple two-state toggle; "reset to system" is not exposed).
 */

const KEY = "bp-theme";
const mq = window.matchMedia("(prefers-color-scheme: light)");

function stored(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function current(): "light" | "dark" {
  return (stored() ?? (mq.matches ? "light" : "dark")) as "light" | "dark";
}

function apply(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")) {
    btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }
}

function onToggleClick(e: Event) {
  const btn = (e.target as Element).closest("[data-theme-toggle]");
  if (!btn) return;
  const next = current() === "light" ? "dark" : "light";
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* private mode — theme still applies for this page view */
  }
  apply(next);
}

// Event delegation on document: survives View Transitions DOM swaps and
// never double-binds (this module is evaluated once per full page load).
document.addEventListener("click", onToggleClick);

// Follow OS changes while in system mode.
mq.addEventListener("change", () => {
  if (!stored()) apply(mq.matches ? "light" : "dark");
});

// Re-assert after every View Transition swap (new <html> attributes) and
// sync the toggle buttons that arrived with the new page.
document.addEventListener("astro:after-swap", () => apply(current()));

apply(current());
