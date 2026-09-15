/**
 * Compact-chrome drawer: open/close, focus trap, iOS scroll lock, inert-behind,
 * and the drawer → region-sheet hand-off.
 *
 * Markup contract (MobileDrawer.astro / MobileBar.astro):
 *   <button data-mobile-menu-trigger aria-controls="mobile-menu" aria-expanded="false">
 *   <div id="mobile-menu" data-mobile-menu hidden role="dialog">
 *      … <button data-mobile-menu-close> · [data-mobile-menu-backdrop] ·
 *      <button data-mobile-menu-picker>  (opens the LocalePicker sheet) …
 *
 * Behaviour:
 *   - Trigger opens. Esc, backdrop, close button, or any internal <a> closes.
 *   - Focus trapped while open, returned to the trigger on close.
 *   - Body scroll locked via scroll-lock.ts (position:fixed — holds on iOS).
 *   - The rest of the page is set `inert` while open, so assistive tech and Tab
 *     cannot wander behind the dialog (the manual Tab trap is the fallback).
 *   - "Language & region" closes the drawer, then opens the bar's LocalePicker
 *     sheet once the close transition ends.
 *   - View Transitions: force-closed and fully torn down on astro:before-swap;
 *     re-bound idempotently on astro:page-load.
 */
import { lockScroll, unlockScroll, resetScrollLock } from "./scroll-lock";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, textarea, select';

// Page regions set `inert` while the drawer is open. Only elements present are
// touched, and only those we set are cleared.
const INERT_SELECTORS = ["#main", "[data-mobile-bar]", "footer", "[data-consent-root]"];

interface MenuState {
  trigger: HTMLButtonElement | null;
  panel: HTMLElement | null;
  lastFocused: HTMLElement | null;
  inerted: HTMLElement[];
  closing: boolean;
}

const state: MenuState = {
  trigger: null,
  panel: null,
  lastFocused: null,
  inerted: [],
  closing: false,
};

function focusables(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null,
  );
}

function setInert(on: boolean): void {
  if (on) {
    state.inerted = [];
    for (const sel of INERT_SELECTORS) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        if (state.panel && (el === state.panel || el.contains(state.panel))) return;
        el.setAttribute("inert", "");
        state.inerted.push(el);
      });
    }
  } else {
    state.inerted.forEach((el) => el.removeAttribute("inert"));
    state.inerted = [];
  }
}

function open(): void {
  const { trigger, panel } = state;
  if (!trigger || !panel || state.closing) return;
  state.lastFocused = document.activeElement as HTMLElement | null;
  panel.hidden = false;
  void panel.offsetWidth; // reflow so the transform transition runs
  panel.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  lockScroll();
  setInert(true);
  focusables(panel)[0]?.focus();
}

interface CloseOpts {
  returnFocus?: boolean;
  then?: () => void;
}

function close(opts: CloseOpts = {}): void {
  const { trigger, panel, lastFocused } = state;
  if (!trigger || !panel || panel.hidden) return;
  const { returnFocus = false, then } = opts;
  state.closing = true;
  panel.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  unlockScroll();
  setInert(false);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    panel.removeEventListener("transitionend", onEnd);
    panel.hidden = true;
    state.closing = false;
    if (returnFocus) trigger.focus();
    then?.();
  };
  const onEnd = (e: TransitionEvent) => {
    if (e.target === panel) finish();
  };
  panel.addEventListener("transitionend", onEnd);
  // Fallback for skipped/instant transitions (reduced motion, no transitionend).
  window.setTimeout(finish, 350);
}

function openPicker(): void {
  // The visible LocalePicker — the compact bar's; the desktop one is
  // display:none at this width, so offsetParent tells them apart.
  const pickers = Array.from(
    document.querySelectorAll<HTMLDetailsElement>("[data-locale-picker]"),
  ).filter((el) => el.offsetParent !== null);
  const picker = pickers[0];
  if (!picker) return;
  picker.open = true;
  const current =
    picker.querySelector<HTMLElement>("[data-locale-picker-item].is-current") ??
    picker.querySelector<HTMLElement>("[data-locale-picker-item]");
  current?.focus();
}

function handleKeydown(e: KeyboardEvent): void {
  const { panel, trigger } = state;
  if (!panel || panel.hidden) return;
  if (e.key === "Escape") {
    e.preventDefault();
    close({ returnFocus: true });
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
  void trigger;
}

function handleClick(e: MouseEvent): void {
  const target = e.target as HTMLElement | null;
  if (!target || !state.panel) return;
  // Region row → close the drawer, then open the picker sheet.
  if (target.closest("[data-mobile-menu-picker]")) {
    e.preventDefault();
    close({ returnFocus: false, then: openPicker });
    return;
  }
  // Internal link → navigating; close.
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (link && state.panel.contains(link)) {
    close();
    return;
  }
  if (target.closest("[data-mobile-menu-close]")) {
    close({ returnFocus: true });
    return;
  }
  if (target.dataset.mobileMenuBackdrop !== undefined) {
    close();
  }
}

function openHandler(): void {
  open();
}

function detach(): void {
  document.removeEventListener("keydown", handleKeydown);
  if (state.panel) state.panel.removeEventListener("click", handleClick);
  if (state.trigger) state.trigger.removeEventListener("click", openHandler);
}

function attach(): void {
  detach();
  const trigger = document.querySelector<HTMLButtonElement>("[data-mobile-menu-trigger]");
  const panel = document.querySelector<HTMLElement>("[data-mobile-menu]");
  if (!trigger || !panel) {
    state.trigger = null;
    state.panel = null;
    return;
  }
  state.trigger = trigger;
  state.panel = panel;
  trigger.addEventListener("click", openHandler);
  panel.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
}

attach();
document.addEventListener("astro:page-load", attach);
document.addEventListener("astro:before-swap", () => {
  // Tear down completely: a navigation started from an open drawer must never
  // leave the next page scroll-locked or inert.
  setInert(false);
  resetScrollLock();
  if (state.panel) {
    state.panel.classList.remove("is-open");
    state.panel.hidden = true;
  }
  state.trigger?.setAttribute("aria-expanded", "false");
  state.closing = false;
});
