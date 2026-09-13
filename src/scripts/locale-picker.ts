/**
 * Locale (region / language) picker enhancement.
 *
 * Drives the <details data-locale-picker> in LocalePicker.astro.
 *
 * Unlike the mega-menu — which replaced <details> with an explicit
 * button+div state machine — this stays a native <details> and is only
 * PROGRESSIVELY ENHANCED. A region picker is international-navigation
 * surface: it must stay usable and crawlable with no JS, so the markup
 * carries the behaviour and this file only adds polish on top.
 *
 * Adds
 *   - Esc — close + return focus to the trigger
 *   - Outside click / focus leaving the picker — close
 *   - ArrowDown / ArrowUp on the trigger — open + focus first / last item
 *   - Inside the menu: ↑ / ↓ cycle (wrap), Home / End jump, Esc closes
 *   - Click an item — close immediately so the next page can't inherit it
 *   - Only one picker open at a time (Nav + IntlLayout never coexist today,
 *     but the invariant is free to hold)
 *   - astro:before-swap — force close before a View Transition swap
 *   - astro:page-load — re-bind idempotently
 *
 * No-ops when the trigger or menu is missing, so it survives the breakpoints
 * where the nav hides the picker entirely.
 */

// IIFE so these top-level declarations don't collide with the other inline
// scripts Base.astro loads into the same project during type-check.
(() => {

interface Refs {
  root: HTMLDetailsElement;
  trigger: HTMLElement;
  menu: HTMLElement;
}

function items(refs: Refs): HTMLAnchorElement[] {
  return Array.from(
    refs.menu.querySelectorAll<HTMLAnchorElement>("[data-locale-picker-item]"),
  );
}

function close(refs: Refs, returnFocus = false): void {
  if (!refs.root.open) return;
  refs.root.open = false;
  if (returnFocus) refs.trigger.focus();
}

function closeOthers(except: HTMLDetailsElement): void {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-locale-picker][open]")
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
  if (root.dataset.localePickerBound === "1") return;
  root.dataset.localePickerBound = "1";

  const trigger = root.querySelector<HTMLElement>("[data-locale-picker-trigger]");
  const menu = root.querySelector<HTMLElement>("[data-locale-picker-menu]");
  if (!trigger || !menu) return;

  const refs: Refs = { root, trigger, menu };
  const scrim = root.querySelector<HTMLElement>("[data-locale-picker-scrim]");
  const closeBtn = root.querySelector<HTMLElement>("[data-locale-picker-close]");

  // Keep at most one picker open.
  root.addEventListener("toggle", () => {
    if (root.open) closeOthers(root);
  });

  // Keyboard on the trigger. Enter/Space are left to <details>' native
  // behaviour — overriding them is how you break the no-JS contract.
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

  // Keyboard inside the menu.
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

  // Choosing a region closes immediately, then navigation proceeds.
  menu.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) close(refs);
  });

  // Mobile-sheet scrim tap / X button. Both live INSIDE <details>, so the
  // outside-click and focusin handlers below (which check
  // !root.contains(e.target)) never treat them as "outside" — they need
  // their own explicit close.
  scrim?.addEventListener("click", () => close(refs, true));
  closeBtn?.addEventListener("click", () => close(refs, true));

  // Outside click / focus-out are DOCUMENT listeners, bound once at module
  // scope below — not here. This attach() runs again on every View Transition
  // (the picker is re-created with each page, so the data-bound guard on it is
  // gone too), and binding document listeners per attach() leaked two
  // permanent handlers per soft navigation, each closing over a detached root.
}

// Outside click closes whichever picker is open. Roots are looked up at event
// time, so this survives DOM swaps without ever being re-bound.
document.addEventListener("click", (e) => {
  for (const root of document.querySelectorAll<HTMLDetailsElement>("[data-locale-picker][open]")) {
    if (!root.contains(e.target as Node)) root.open = false;
  }
});

// Tabbing out of the picker closes it too — an open menu trailing behind
// the keyboard focus is the classic <details> menu wart.
document.addEventListener("focusin", (e) => {
  for (const root of document.querySelectorAll<HTMLDetailsElement>("[data-locale-picker][open]")) {
    if (!root.contains(e.target as Node)) root.open = false;
  }
});

function init(): void {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-locale-picker]")
    .forEach((root) => attach(root));
}

init();

// View Transitions: close before the swap so the next page mounts clean.
document.addEventListener("astro:before-swap", () => {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-locale-picker][open]")
    .forEach((el) => {
      el.open = false;
    });
});
document.addEventListener("astro:page-load", init);

})();
