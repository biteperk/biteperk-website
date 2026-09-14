/** Shared helpers for gates that walk a built tree. */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/** Every `index.html` under `dist`, as [{ file, route }] where route is "/" or "/a/b/". */
export function pages(dist) {
  const out = [];
  const walk = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (n === "index.html") out.push({ file: p, route: "/" + relative(dist, p).replace(/index\.html$/, "").split("\\").join("/") });
    }
  };
  walk(dist);
  return out;
}

export const html = (file) => readFileSync(file, "utf8");
export const unescape = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
/** Strip site chrome so a link found is an editorial (in-body) link. */
export const bodyOnly = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<header[\s\S]*?<\/header>/g, "")
    .replace(/<footer[\s\S]*?<\/footer>/g, "")
    .replace(/<nav[\s\S]*?<\/nav>/g, "");
