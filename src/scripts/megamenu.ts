/**
 * Mega-menu control script.
 *
 * Drives the Products mega-menu in Nav.astro / NavDropdown.astro.
 * Replaces the previous <details>/<summary> approach with an explicit
 * state machine on a <button aria-expanded> + <div role="menu">.
 *
 * Behaviour
 *   - Click / Enter / Space on trigger: toggle. On open via keyboard,
 *     focus the first menu item; on open via pointer, focus stays on
 *     the trigger so touch users aren't yanked into the menu.
 *   - Arrow Down on trigger: open + focus first.
 *   - Arrow Up on trigger: open + focus last.
 *   - Inside the panel:
 *       ↑ / ↓ — cycle items (wrap)
 *       Home / End — jump to first / last
 *       Esc — close + return focus to trigger
 *       Tab — let the browser move focus OUT of the menu (WAI-ARIA)
 *   - Hover (pointer:fine + hover:hover only): open after 60ms; close
 *     after 220ms once cursor leaves both the trigger and the panel.
 *     Re-entering either cancels the close timer.
 *   - Touch / coarse pointer: hover-open disabled. Tap toggles. Tap
 *     anywhere outside closes.
 *   - Click on a menu item: close immediately so the next page doesn't
 *     inherit an open menu.
 *   - astro:before-swap (View Transitions): force close before the
 *     swap so the new page renders with a clean state.
 *   - astro:page-load: re-bind idempotently.
 *
 * The script tolerates the trigger or panel being missing (no-ops)
 * which means it survives mobile breakpoints where the menu is
 * hidden by CSS.
 */

// Wrap in IIFE so top-level function declarations (init, attach, etc.)
// don't collide across other inline-loaded scripts in the same project
// during Astro's type-check pass.
(() => {

const CLOSE_DELAY = 220;
const HOVER_OPEN_DELAY = 60;

interface MenuRefs {
  root: HTMLElement;
  trigger: HTMLButtonElement;
  panel: HTMLElement;
  items: HTMLAnchorElement[];
  closeTimer?: number;
  hoverOpenTimer?: number;
}

function refreshItems(refs: MenuRefs): void {
  refs.items = Array.from(
    refs.panel.querySelectorAll<HTMLAnchorElement>(
      'a[role="menuitem"], a.megamenu-card, a.megamenu-foot-link'
    )
  );
}

function canHover(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function clearTimers(refs: MenuRefs): void {
  if (refs.closeTimer !== undefined) {
    clearTimeout(refs.closeTimer);
    refs.closeTimer = undefined;
  }
  if (refs.hoverOpenTimer !== undefined) {
    clearTimeout(refs.hoverOpenTimer);
    refs.hoverOpenTimer = undefined;
  }
}

function setOpen(refs: MenuRefs, open: boolean, focusFirst = false): void {
  clearTimers(refs);
  refs.trigger.setAttribute("aria-expanded", open ? "true" : "false");
  refs.root.classList.toggle("is-open", open);
  if (open) {
    refs.panel.hidden = false;
    if (focusFirst) {
      refreshItems(refs);
      refs.items[0]?.focus();
    }
  } else {
    refs.panel.hidden = true;
    // Drop focus back to the trigger only if focus is currently inside
    // the panel; otherwise we leave focus where the user put it.
    if (refs.panel.contains(document.activeElement)) {
      refs.trigger.focus();
    }
  }
}

function scheduleClose(refs: MenuRefs): void {
  clearTimers(refs);
  refs.closeTimer = window.setTimeout(() => {
    refs.closeTimer = undefined;
    setOpen(refs, false);
  }, CLOSE_DELAY);
}

function scheduleHoverOpen(refs: MenuRefs): void {
  if (refs.trigger.getAttribute("aria-expanded") === "true") return;
  clearTimers(refs);
  refs.hoverOpenTimer = window.setTimeout(() => {
    refs.hoverOpenTimer = undefined;
    setOpen(refs, true, false);
  }, HOVER_OPEN_DELAY);
}

function focusByOffset(refs: MenuRefs, from: HTMLElement, offset: 1 | -1): void {
  refreshItems(refs);
  if (refs.items.length === 0) return;
  const i = refs.items.indexOf(from as HTMLAnchorElement);
  const len = refs.items.length;
  const next = i === -1 ? (offset === 1 ? 0 : len - 1) : (i + offset + len) % len;
  refs.items[next].focus();
}

function attach(root: HTMLElement): void {
  if (root.dataset.megamenuBound === "1") return;
  root.dataset.megamenuBound = "1";

  const trigger = root.querySelector<HTMLButtonElement>("[data-megamenu-trigger]");
  const panel = root.querySelector<HTMLElement>("[data-megamenu-panel]");
  if (!trigger || !panel) return;

  const refs: MenuRefs = {
    root,
    trigger,
    panel,
    items: [],
  };
  refreshItems(refs);

  // Click: toggle. Always cancels pending timers.
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    setOpen(refs, !isOpen, false);
  });

  // Keyboard on trigger.
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      setOpen(refs, !isOpen, /* focusFirst on open */ !isOpen);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(refs, true, true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(refs, true, false);
      refreshItems(refs);
      refs.items[refs.items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      if (trigger.getAttribute("aria-expanded") === "true") {
        e.preventDefault();
        setOpen(refs, false);
      }
    }
  });

  // Keyboard inside the panel.
  panel.addEventListener("keydown", (e) => {
    const active = document.activeElement as HTMLElement | null;
    if (!active || !panel.contains(active)) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusByOffset(refs, active, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusByOffset(refs, active, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      refreshItems(refs);
      refs.items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      refreshItems(refs);
      refs.items[refs.items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(refs, false);
      trigger.focus();
    }
  });

  // Hover bridge (desktop pointers only).
  root.addEventListener("mouseenter", () => {
    if (!canHover()) return;
    scheduleHoverOpen(refs);
  });
  root.addEventListener("mouseleave", () => {
    if (!canHover()) return;
    scheduleClose(refs);
  });
  // Panel hover keeps it open. Without this the bounding box of <root>
  // wouldn't include children that overflow into the panel area on
  // some browsers.
  panel.addEventListener("mouseenter", () => {
    if (!canHover()) return;
    clearTimers(refs);
  });
  panel.addEventListener("mouseleave", () => {
    if (!canHover()) return;
    scheduleClose(refs);
  });

  // Click on an item: close immediately, then let the navigation
  // continue. Prevents stale-open menus on the next page.
  panel.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest("a");
    if (link && panel.contains(link)) {
      setOpen(refs, false);
    }
  });

  // Outside click is a single module-scope document listener (below) that
  // looks menus up through REFS at event time. Binding it here would add one
  // permanent handler per attach(), i.e. per mount of a non-persisted nav
  // (an au-en → intl → au-en round trip mounts a fresh one).
  REFS.set(root, refs);
}

/** Live refs per mounted root; WeakMap so a swapped-out nav is collectable. */
const REFS = new WeakMap<HTMLElement, MenuRefs>();

// Outside click closes any open mega-menu.
document.addEventListener("click", (e) => {
  const target = e.target as Node;
  for (const root of document.querySelectorAll<HTMLElement>("[data-megamenu]")) {
    const refs = REFS.get(root);
    if (!refs || refs.trigger.getAttribute("aria-expanded") !== "true") continue;
    if (!root.contains(target)) setOpen(refs, false);
  }
});

function init(): void {
  document
    .querySelectorAll<HTMLElement>("[data-megamenu]")
    .forEach((root) => attach(root));
}

init();

// View Transitions: force close before swap so the new page mounts
// with a clean state; re-bind after swap (DOM is replaced).
document.addEventListener("astro:before-swap", () => {
  document.querySelectorAll<HTMLElement>("[data-megamenu]").forEach((root) => {
    const trigger = root.querySelector<HTMLButtonElement>("[data-megamenu-trigger]");
    const panel = root.querySelector<HTMLElement>("[data-megamenu-panel]");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
    root.classList.remove("is-open");
  });
});
document.addEventListener("astro:page-load", init);

})();
