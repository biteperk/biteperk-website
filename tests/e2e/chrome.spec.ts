import { registerChromeContract } from "../helpers/chrome-contract";
import { p } from "../helpers/routes";
import { locales } from "../../src/data/locales";

/**
 * The shared compact-chrome contract, run against the AU tree. Identical body
 * to the one the international suite registers (tests/intl/chrome.spec.ts) — the
 * point is that both trees satisfy the SAME contract, so the two mobile
 * experiences cannot drift. AU-specific chrome (the phone/sign-in foot slot,
 * the desktop mega-menu) is covered in menus.spec.ts / mobile.spec.ts.
 *
 * Runs under the chromium + webkit (desktop-device) projects; the contract sets
 * its own viewports, so it exercises every compact width without needing the
 * phone-device projects.
 */
registerChromeContract({
  homes: [p()],
  localeCount: locales.length,
  currentRegionLabel: "Australia — English",
  extraPaths: [p("/sydney/"), p("/products/voxtable/")],
});
