# Releasing biteperk.com

Two long-lived branches, one flow, semantic version tags. Nothing else is permanent.

## Branches
| Branch | Role | Deploys to |
|---|---|---|
| `integration` (default) | Every PR lands here first. Squash-merged, CI green, up to date with the base (rulesets). | **Staging**, automatically on every push: https://biteperk-staging.web.app (noindex, `deploy-staging.yml`). |
| `main` | Production. Only receives promotion PRs from `integration` (and, rarely, a hotfix based on `main` that is synced back into `integration` straight after). | **Production**, manually: `gh workflow run "Deploy Firebase Hosting" --ref main`. |

Feature branches are short-lived, named `feat/…`, `fix/…`, `docs/…`, `infra/…`, and deleted on merge. **One PR at a time — never stack PRs**: the rulesets are squash-only with strict up-to-date checks, so a stack cascades on every merge (13 Sep 2026: sixteen stacked PRs collapsed into one squash).

## Versions
Semantic versioning on annotated tags, created as GitHub Releases. `v1-final` (June 2026) is the old site; the rebuild continues the line from **v2**.

- `vX.Y.Z` — a production release, tagged on the `main` commit that was deployed. `Y` bumps for a wave of features (a Phase or a market), `Z` for hotfixes, `X` for a rebuild-scale change.
- `vX.Y.Z-rc.N` — a release candidate, tagged on `integration` (marked *pre-release*) when it is on staging for review. `rc.N` increments with each candidate.
- `package.json` `version` is bumped to the release number in the promotion PR so `stamp-build` and the deployed bundle carry it.

## Promoting integration → main (a release)
1. Review staging. Everything on `integration` is what production will be.
2. Tag the candidate if not already: `gh release create v2.1.0-rc.N --target integration --prerelease --generate-notes`.
3. Open the promotion PR `integration → main` (title `release: v2.1.0`), bump `package.json` `version` in it. Squash-merge when CI OK is green.
4. Deploy from `main`: functions first if `functions/` changed, then hosting — `gh workflow run "Deploy Firebase Hosting" --ref main`. Verify at the edge (`curl -I https://biteperk.com/gb-en/` → 200, `max-age=300`, `content-language`).
5. Tag the release on the deployed `main` commit: `gh release create v2.1.0 --target main --generate-notes` (delete or keep the rc — keep; it documents what was on staging).
6. Post-release: Search Console sitemap resubmit, re-scrape share caches if OG cards changed, update `docs/phase1/PLAN.md` / the ops log.

## Hotfixes
Base on `main`, PR to `main`, deploy, tag `vX.Y.(Z+1)`, then open `sync: main → integration` so staging never runs behind production. Keep the two branches' `firebase.json` production block identical (`check-staging-hosting` regenerates the staging copy — run `node scripts/build/sync-staging-hosting.mjs` in the sync PR).

## Where things are
- Staging: https://biteperk-staging.web.app — same function as production; staging leads are tagged `environment: "staging"` and kept out of Zoho.
- Releases: https://github.com/biteperk/biteperk-website/releases
- Current: `v2.0.0` = `main` (hotfixes X1–X4); `v2.1.0-rc.1` = `integration` (Phase 1) on staging.
