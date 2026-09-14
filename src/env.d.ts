/// <reference types="astro/client" />

/**
 * Global augmentations. Kept minimal: only third-party globals that our own
 * TypeScript touches under `astro check` (strict) belong here.
 */
declare global {
  interface Window {
    /**
     * Umami analytics tracker, injected by the <script src=".../script.js">
     * in the document head. Optional because it is absent before the script
     * loads, when the build has no website id, and on hosts excluded by
     * `data-domains`. Always guard with `window.umami?.`.
     * @see https://umami.is/docs/tracker-functions
     */
    umami?: {
      track: (
        event?:
          | string
          | ((props: Record<string, unknown>) => Record<string, unknown>),
        data?: Record<string, unknown>,
      ) => Promise<string> | void;
      identify: (data: Record<string, unknown>) => Promise<string> | void;
    };
  }
}

export {};
