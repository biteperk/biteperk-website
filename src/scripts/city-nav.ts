/**
 * Cities nav dropdown enhancement — drives <details data-city-nav> in
 * src/components/intl/CityNav.astro.
 *
 * A structural clone of locale-picker.ts with its own data-attribute
 * namespace: chrome.spec's [data-locale-picker-trigger]/-item locators are
 * strict-mode, so the two dropdowns must never share attributes. Same
 * progressive-enhancement contract — native <details> carries the
 * behaviour, this only adds polish — and the same behaviours:
 *
 *   - Esc — close + return focus to the trigger
 *   - Outside click / focus leaving — close
 *   - ArrowDown / ArrowUp on the trigger — open + focus first / last item
 *   - Inside the menu: ↑ / ↓ cycle (wrap), Home / End jump, Esc closes
 *   - Click an item — close immediately
 *   - astro:before-swap force-close; astro:page-load idempotent re-bind
 *
 * One extra: closeOthers() also sweeps [data-locale-picker][open] so a
 * keyboard-opened Cities menu closes an open region picker (the reverse
 * direction is covered by locale-picker's own outside-click/focusin
 * listeners — clicking this trigger IS an outside click for that one).
 *
 * Loads sitewide via Base.astro's shared bundle and no-ops on every page
 * without [data-city-nav] (all AU pages, all city-less market trees).
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
    refs.menu.querySelectorAll<HTMLAnchorElement>("[data-city-nav-item]"),
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
      "[data-city-nav][open], [data-locale-picker][open]",
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
  if (root.dataset.cityNavBound === "1") return;
  root.dataset.cityNavBound = "1";

  const trigger = root.querySelector<HTMLElement>("[data-city-nav-trigger]");
  const menu = root.querySelector<HTMLElement>("[data-city-nav-menu]");
  if (!trigger || !menu) return;

  const refs: Refs = { root, trigger, menu };
  const scrim = root.querySelector<HTMLElement>("[data-city-nav-scrim]");
  const closeBtn = root.querySelector<HTMLElement>("[data-city-nav-close]");

  root.addEventListener("toggle", () => {
    if (root.open) closeOthers(root);
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

  // Mobile-sheet scrim tap / X button — see locale-picker.ts for why these
  // need their own listener instead of falling out of the outside-click check.
  scrim?.addEventListener("click", () => close(refs, true));
  closeBtn?.addEventListener("click", () => close(refs, true));

  document.addEventListener("click", (e) => {
    if (root.open && !root.contains(e.target as Node)) close(refs);
  });

  document.addEventListener("focusin", (e) => {
    if (root.open && !root.contains(e.target as Node)) close(refs);
  });
}

function init(): void {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-city-nav]")
    .forEach((root) => attach(root));
}

init();

document.addEventListener("astro:before-swap", () => {
  document
    .querySelectorAll<HTMLDetailsElement>("[data-city-nav][open]")
    .forEach((el) => {
      el.open = false;
    });
});
document.addEventListener("astro:page-load", init);

})();
