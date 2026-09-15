/**
 * Reference-counted body scroll lock that actually holds on iOS.
 *
 * `body { overflow: hidden }` alone does NOT stop Safari's rubber-band scroll
 * behind an overlay — the classic "the page underneath scrolls while the drawer
 * is open" bug. The reliable fix is `position: fixed` on the body with the
 * scroll offset preserved and restored on release.
 *
 * Reference-counted because the drawer → region-sheet hand-off closes the drawer
 * (unlock) and opens the sheet (lock) in overlapping ticks; a boolean lock would
 * leave the page unlocked for a frame or, worse, restore scroll twice. Callers
 * pair lock()/unlock(); the body is only fixed while the count is > 0.
 *
 * Shared by MobileDrawer and LocalePicker (its ≤COMPACT_MAX bottom sheet). The
 * consent modal keeps its own, older handling — out of scope here.
 */

let depth = 0;
let savedY = 0;

function bodyStyle(): CSSStyleDeclaration | null {
  return typeof document !== "undefined" ? document.body.style : null;
}

export function lockScroll(): void {
  const s = bodyStyle();
  if (!s) return;
  if (depth === 0) {
    savedY = window.scrollY || window.pageYOffset || 0;
    s.position = "fixed";
    s.top = `-${savedY}px`;
    s.left = "0";
    s.right = "0";
    s.width = "100%";
    // Keep the class too: existing CSS (body.no-scroll{overflow:hidden}) and
    // any test that asserts it still hold.
    document.body.classList.add("no-scroll");
  }
  depth += 1;
}

export function unlockScroll(): void {
  const s = bodyStyle();
  if (!s) return;
  if (depth === 0) return;
  depth -= 1;
  if (depth === 0) {
    s.position = "";
    s.top = "";
    s.left = "";
    s.right = "";
    s.width = "";
    document.body.classList.remove("no-scroll");
    // Restore the scroll position the fixed body discarded.
    window.scrollTo(0, savedY);
  }
}

/** Force the count to zero and clear the fixed body — for View Transition teardown. */
export function resetScrollLock(): void {
  const s = bodyStyle();
  if (!s) return;
  const y = savedY;
  depth = 0;
  const wasFixed = s.position === "fixed";
  s.position = "";
  s.top = "";
  s.left = "";
  s.right = "";
  s.width = "";
  document.body.classList.remove("no-scroll");
  if (wasFixed) window.scrollTo(0, y);
}
