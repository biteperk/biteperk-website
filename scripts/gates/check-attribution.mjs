#!/usr/bin/env node
/**
 * Attribution gate — the repo's git history and pull requests must read as the
 * humans who work on it, and nothing else.
 *
 * Rule (Sam, 15 Sep 2026): no AI co-author trailers and no "Generated with …"
 * lines in any commit message. GitHub maps a `Co-Authored-By: … <noreply@anthropic.com>`
 * trailer to a GitHub account and lists it under Contributors, which is exactly
 * the thing this rule exists to prevent. The full history was scrubbed of them
 * on 15 Sep 2026; this gate keeps it that way.
 *
 * Scans the commit messages in ATTRIBUTION_RANGE (default `origin/main..HEAD`;
 * CI passes the PR's base..head so it only ever judges NEW commits) and fails
 * on any match. Pair with scripts/git-hooks/commit-msg for a local pre-commit
 * check; this gate is the one that cannot be skipped.
 *
 * Fault-inject before trusting: commit with a trailer on a branch and run it.
 */
import { execSync } from "node:child_process";

const RANGE = process.env.ATTRIBUTION_RANGE || "origin/main..HEAD";

const PATTERNS = [
  /co-authored-by:.*\b(claude|anthropic)/i,
  /noreply@anthropic\.com/i,
  /generated with \[?claude/i,
  /\bclaude code\b/i,
];

let log;
try {
  // %x00 separates hash from body, %x01 separates commits — no quoting issues.
  log = execSync(`git log --format=%H%x00%B%x01 ${RANGE}`, { encoding: "utf8" });
} catch {
  console.error(`check-attribution: cannot read git range ${RANGE} (is the base ref fetched?)`);
  process.exit(1);
}

const bad = [];
for (const chunk of log.split("\x01")) {
  const [hash, body = ""] = chunk.split("\x00");
  if (!hash?.trim()) continue;
  for (const p of PATTERNS) {
    const m = body.match(p);
    if (m) { bad.push(`${hash.trim().slice(0, 7)}: ${m[0].trim()}`); break; }
  }
}

if (bad.length) {
  console.error(`check-attribution: ${bad.length} commit(s) in ${RANGE} carry AI attribution — not allowed (CLAUDE.md § Git attribution):`);
  for (const b of bad) console.error(`  ✗ ${b}`);
  console.error(`\nFix: rewrite the message(s) (git commit --amend / rebase -i) to drop the trailer, then force-push the branch.`);
  process.exit(1);
}
console.log(`check-attribution: ok — no AI attribution in ${RANGE}`);
