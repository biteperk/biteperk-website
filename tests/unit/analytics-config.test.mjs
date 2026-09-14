/**
 * Config invariants for the self-hosted Umami analytics setup
 * (src/data/consent.ts). Cheap, no build required; runs in gates:au and
 * gates:global via `node --test tests/unit/`.
 *
 * These pin the contract the head tag, the check-analytics gate and the e2e
 * specs all rely on, and guard the two ways this could silently break:
 *   - an env selecting a website that isn't a real uuid (tracker no-ops), and
 *   - analytics creeping back into TRACKING_ARMED (which would arm the consent
 *     banner across all six trees for a tracker that is exempt by design).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const consent = await loadTS(join(ROOT, "src/data/consent.ts"));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

test("UMAMI_HOST is https and non-localhost; script url derives from it", () => {
  assert.match(consent.UMAMI_HOST, /^https:\/\//);
  assert.doesNotMatch(consent.UMAMI_HOST, /localhost|127\.0\.0\.1/);
  assert.equal(consent.UMAMI_SCRIPT_URL, `${consent.UMAMI_HOST}/script.js`);
});

test("UMAMI_WEBSITE_ID is a uuid and analyticsReady is true", () => {
  assert.match(consent.UMAMI_WEBSITE_ID, UUID);
  assert.equal(consent.analyticsReady, true);
});

test("ANALYTICS_HOSTS (data-domains) is the production host, excluding localhost/staging", () => {
  assert.deepEqual([...consent.ANALYTICS_HOSTS], ["biteperk.com"]);
});

test("analytics does NOT arm the consent banner — it is exempt/opt-out", () => {
  // With no marketing tracker configured, nothing needs consent.
  assert.equal(consent.googleAdsId, null);
  assert.equal(consent.linkedInPartnerId, null);
  assert.equal(consent.TRACKING_ARMED, false);
});

test("the canonical contact goal is contact_form_submitted", () => {
  assert.equal(consent.GOALS.contact_form_submitted, "contact_form_submitted");
  assert.equal(consent.GOAL_ALIASES["form-success"], "contact_form_submitted");
});
