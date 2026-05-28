/**
 * Mobile menu open/close + focus trap + body scroll lock.
 *
 * Markup contract (see MobileMenu.astro):
 *   <button data-mobile-menu-trigger aria-controls="mobile-menu" aria-expanded="false">…
 *   <div id="mobile-menu" data-mobile-menu hidden> …focusable items… <button data-mobile-menu-close>… </div>
 *
 * Behaviour:
 *   - Click trigger → opens. ESC, click on backdrop, or any internal
 *     `<a>` click closes.
 *   - Focus is trapped inside the panel while open and returned to the
 *     trigger on close.
 *   - <body class="no-scroll"> applied while open.
 *   - All bindings are idempotent on `astro:page-load` for View
 *     Transitions.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, textarea, select';

interface MenuState {
  trigger: HTMLButtonElement;
  panel: HTMLElement;
  lastFocused: HTMLElement | null;
  onKey: (e: KeyboardEvent) => void;
  onClick: (e: MouseEvent) => void;
}

const state: MenuState = {
  trigger: null as unknown as HTMLButtonElement,
  panel: null as unknown as HTMLElement,
  lastFocused: null,
  onKey: () => {},
  onClick: () => {},
};

function focusables(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null
  );
}

function open(): void {
  const { trigger, panel } = state;
  if (!trigger || !panel) return;
  state.lastFocused = document.activeElement as HTMLElement | null;
  panel.hidden = false;
  // Force a reflow so the transition takes effect.
  void panel.offsetWidth;
  panel.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  const first = focusables(panel)[0];
  first?.focus();
}

function close(): void {
  const { trigger, panel, lastFocused } = state;
  if (!trigger || !panel) return;
  panel.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
  // Wait for the transition to end before hiding from the a11y tree.
  const onEnd = () => {
    panel.hidden = true;
    panel.removeEventListener("transitionend", onEnd);
  };
  panel.addEventListener("transitionend", onEnd);
  // Fallback for browsers that skip the transition (e.g. reduced motion).
  window.setTimeout(() => {
    if (!panel.classList.contains("is-open")) panel.hidden = true;
  }, 350);
  lastFocused?.focus();
}

function handleKeydown(e: KeyboardEvent): void {
  const { panel, trigger } = state;
  if (!panel || panel.hidden) return;
  if (e.key === "Escape") {
    e.preventDefault();
    close();
    trigger.focus();
    return;
  }
  if (e.key !== "Tab") return;
  const items = focusables(panel);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

function handleClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (!target) return;
  // Close on internal link clicks (visitor is navigating).
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (link && state.panel.contains(link)) {
    close();
    return;
  }
  if (target.closest("[data-mobile-menu-close]")) {
    close();
    return;
  }
  if (target.dataset.mobileMenuBackdrop !== undefined) {
    close();
  }
}

function detach(): void {
  document.removeEventListener("keydown", state.onKey);
  if (state.panel) state.panel.removeEventListener("click", state.onClick);
  if (state.trigger) {
    state.trigger.removeEventListener("click", openHandler);
  }
}

function openHandler(): void {
  open();
}

function attach(): void {
  detach();
  const trigger = document.querySelector<HTMLButtonElement>(
    "[data-mobile-menu-trigger]"
  );
  const panel = document.querySelector<HTMLElement>("[data-mobile-menu]");
  if (!trigger || !panel) return;
  state.trigger = trigger;
  state.panel = panel;
  state.onKey = handleKeydown;
  state.onClick = handleClick;
  trigger.addEventListener("click", openHandler);
  panel.addEventListener("click", state.onClick);
  document.addEventListener("keydown", state.onKey);
}

attach();
document.addEventListener("astro:page-load", attach);
document.addEventListener("astro:before-swap", () => {
  document.body.classList.remove("no-scroll");
});
