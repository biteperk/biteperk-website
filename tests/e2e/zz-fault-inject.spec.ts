import { test, expect } from "@playwright/test";

// CI-verification fault injection (DO NOT MERGE). This test exists to turn
// exactly one Playwright AU shard red so the run proves `fail-fast: false`:
// the sibling shard must run to its own completion, never `cancelled`.
test("ci fault injection — deliberately failing", () => {
  expect(1).toBe(2);
});
