## Summary
<!-- What changed and why -->

## Base branch
- [ ] Feature / fix → **`integration`**
- [ ] Production promotion → **`main`** (from `integration` only)

## Quality
- [ ] `web` CI green (includes gates, Playwright, Lighthouse, rollback path)
- [ ] `Security` CI green (Semgrep + gitleaks)
- [ ] No AU phone/NAP/price leakage onto international pages (`check-truthful`)
- [ ] A11y / copy / perf implications considered

## Production
- [ ] No production deploy needed
- [ ] After merge to `main`, deploy with: `gh workflow run "Deploy Firebase Hosting" --ref main`
