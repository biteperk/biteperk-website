/**
 * Load a TypeScript data module (resolving its relative imports) from Node.
 *
 * The gates read src/data/*.ts at runtime. Since those modules now import each
 * other (cities.ts → locales.ts for the base-aware URL helpers), a plain
 * esbuild `transform` + data-URL import fails: a data: URL has no base to
 * resolve "./locales" against. `build({ bundle: true })` inlines the imports
 * into one module, so the data-URL import has nothing left to resolve.
 *
 * BUILD_TARGET is read from process.env by locales.ts, so callers that need a
 * specific locale base must set it before calling (the gates already do).
 */
import { build } from "esbuild";

/** @param {string} absPath absolute path to a .ts entry module */
export async function loadTS(absPath) {
  const result = await build({
    entryPoints: [absPath],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}
