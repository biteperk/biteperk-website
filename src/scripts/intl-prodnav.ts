/**
 * Products nav dropdown enhancement — drives <details data-intl-prodnav> in
 * src/components/intl/IntlProductNav.astro.
 *
 * A structural clone of city-nav.ts (own data-attribute namespace so it never
 * collides with the picker / city-nav strict-mode locators in chrome.spec),
 * plus the AU mega-menu's hover intent: on a fine pointer that supports hover,
 * the menu opens shortly after the pointer enters and closes shortly after it
 * leaves, so moving into the panel keeps it open. Progressive enhancement —
 * native <details> carries click/keyboard even with no JS.
 *
 * Behaviours:
 *   - hover intent (fine pointer only): open after 60ms, close 220ms after leave
 *   - Enter/Space stay native on the summary
 *   - ArrowDown / ArrowUp on the trigger — open + focus first / last item
 *   - Inside the menu: ↑/↓ cycle (wrap), Home/End jump, Esc close + refocus
 *   - Outside click / focus leaving — close
 *   - Click an item — close immediately
 *   - closeOthers() sweeps the city nav and region picker so one bar menu is
 *     open at a time (they sweep this one in return)
 *   - astro:before-swap force-close; astro:page-load idempotent re-bind
 *
 * Loaded from IntlLayout.astro (NOT Base.astro — that would ship it to every
 * AU page, which has its own megamenu.ts). No-ops on any page without the root.
 */

// IIFE so these top-level declarations don't collide with the other inline
// scripts loaded into the same project during type-check.
(() => {

interface Refs {
  root: HTMLDetailsElement;
  trigger: HTMLElement;
  menu: HTMLElement;
}

const HOVER_OPEN_DELAY = 60;
const CLOSE_DELAY = 220;
const canHover = (): boolean =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function items(refs: Refs): HTMLAnchorElement[] {
  return Array.from(
    refs.menu.querySelectorAll<HTMLAnchorElement>("[data-intl-prodnav-item]"),
  );
}

function close(refs: Refs, returnFocus = false): void {
  if (!refs.root.open) return;
  refs.root.open = false;
  if (returnFocus) refs.trigger.focus();
}

function closeOthers(except: HTMLDetailsElement): void {
  document
    .querySelectorAll<HTMLDetailsElement>(
      "[data-intl-prodnav][open], [data-city-nav][open], [data-locale-picker][open]",
    )
    .forEach((el) => {
      if (el !== except) el.open = false;
    });
}

function focusByOffset(refs: Refs, from: Element | null, offset: 1 | -1): void {
  const list = items(refs);
  if (list.length === 0) return;
  const i = from ? list.indexOf(from as HTMLAnchorElement) : -1;
  const next = i === -1 ? (offset === 1 ? 0 : list.length - 1) : (i + offset + list.length) % list.length;
  list[next].focus();
}

function attach(root: HTMLDetailsElement): void {
  if (root.dataset.intlProdnavBound === "1") return;
  root.dataset.intlProdnavBound = "1";

  const trigger = root.querySelector<HTMLElement>("[data-intl-prodnav-trigger]");
  const menu = root.querySelector<HTMLElement>("[data-intl-prodnav-menu]");
  if (!trigger || !menu) return;

  const refs: Refs = { root, trigger, menu };
  let openTimer: number | undefined;
  let closeTimer: number | undefined;
  const clearTimers = (): void => {
    if (openTimer) { clearTimeout(openTimer); openTimer = undefined; }
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = undefined; }
  };

  root.addEventListener("toggle", () => {
    if (root.open) closeOthers(root);
  });

  // Hover intent — fine pointers only (touch keeps the click-to-open <details>
  // behaviour, or the menu would flicker open under a tap).
  root.addEventListener("mouseenter", () => {
    if (!canHover()) return;
    clearTimers();
    openTimer = window.setTimeout(() => { root.open = true; }, HOVER_OPEN_DELAY);
  });
  root.addEventListener("mouseleave", () => {
    if (!canHover()) return;
    clearTimers();
    closeTimer = window.setTimeout(() => { root.open = false; }, CLOSE_DELAY);
  });

  // Enter/Space stay native — overriding them breaks the no-JS contract.
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      root.open = true;
      items(refs)[0]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      root.open = true;
      const list = items(refs);
      list[list.length - 1]?.focus();
    } else if (e.key === "Escape" && root.open) {
      e.preventDefault();
      close(refs);
    }
  });

  menu.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (!active || !menu.contains(active)) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusByOffset(refs, active, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusByOffset(refs, active, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      items(refs)[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const list = items(refs);
      list[list.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(refs, true);
    }
  });

  menu.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) close(refs);
  });

  // Outside click / focus-out live at module scope below — binding them per
  // attach() would leak a pair of permanent document listeners on every View
  // Transition (see city-nav.ts / locale-picker.ts).
}

document.addEventListener("click", (e) => {
  for (const root of document.querySelectorAll<HTMLDetailsElement>("[data-intl-prodnav][open]")) {
    if (!root.contains(e.target as Node)) root.open = false;
  }
});

document.addEventListener("focusin", (e) => {
  for (const root of document.querySelectorAll<HTMLDetailsElement>("[data-intl-prodnav][open]")) {
    if (!root.contains(e.target as Node)) root.open = false;
  }
});

function init(): void {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-intl-prodnav]")
    .forEach((root) => attach(root));
}

init();

document.addEventListener("astro:before-swap", () => {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-intl-prodnav][open]")
    .forEach((el) => {
      el.open = false;
    });
});
document.addEventListener("astro:page-load", init);

})();
