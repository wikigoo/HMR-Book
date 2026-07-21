---
title: Weekly Health Report (2026-07-20)
description: Automated weekly system health check for HMR infrastructure, endpoints, repositories, and documentation staleness.
---

## Status Summary

| Check | Status | Notes |
|---|---|---|
| Server (containers, disk/DB, backups) | ✅ | All 3 containers healthy; snapshot fresh (< 48h); both backup workflows green |
| Live endpoints | ✅ | All expected endpoints 200; book.hmrbot.com unreachable but that's expected (site deliberately removed 2026-07-14) |
| Repo PRs | ⚠️ | 2 open PRs awaiting owner review (HMR-Astro #111, HMR-Flutter #27) |
| Repo workflows (7-day window) | ⚠️ | HMR-Astro CI red on every run since 2026-07-19 (known pre-existing type-check debt, not a new regression); one transient HMR-RAG crawl failure on 2026-07-14 self-recovered same day |
| Canonical facts accuracy (FACTS.md + docs staleness) | 🔴 | FACTS.md and HMR-Astro's own README are both out of date on the /ai chat architecture — see Findings #1 |

## Key Findings

### 1. CRITICAL: FACTS.md (HMR-Ops) is stale on the `/ai` chat architecture

FACTS.md claims hmrbot.com/ai runs Astro+React chat with D1 storage. Production now returns Flutter web shell.
Verified via direct fetch and PR #111 details. The 2026-07-19 revert was never recorded in FACTS.md.
The Astro rewrite was deployed then rolled back same day (15:38-15:54 UTC).

**Recommendation:** FACTS.md needs a PR updating the `/ai chat` and `Auth` sections to reflect the revert.

### 2. HMR-Astro README.md is also stale (this week's docs-staleness rotation target)

| File | Stale claim | Reality |
|---|---|---|
| README.md | Lists `ai.astro` and `chat.astro` as current files | Both deleted from `main` on 2026-07-19 |
| README.md | Describes `/ai` backend as Flowise via `src/pages/api/chat.ts` | File exists but orphaned—/ai now served by Flutter web |
| README.md | Documents `chat.` subdomain redirect | Target no longer exists; dead code |

### 3. Two open PRs awaiting owner review

- **HMR-Astro #111** — Remove orphaned Astro chat subsystem (2026-07-19T17:40 UTC)
- **HMR-Flutter #27** — Plain-text assistant bubbles per design (2026-07-19T13:23 UTC)

### 4. HMR-Astro CI has failed on all 5 recent runs (2026-07-19)

Root cause: 15 pre-existing `astro check` type errors in `Layout.astro` canvas script.
Not a new regression. Non-required check. Unresolved for one report cycle.

### 5-7. Additional findings

- HMR-RAG transient failure (2026-07-14) self-resolved same day
- `book.hmrbot.com` expected-down (site removed 2026-07-14)
- Drive `To Do` tracker unreachable (permissions/connector issue)

## Docs-Staleness Results

**Rotation:** ISO week 30, 30%6=0 = HMR-Astro
**Result:** 3 stale claims found — all traceable to 2026-07-19 `/ai` revert

## Open Items

- [ ] Update `HMR-Ops/FACTS.md` to reflect 2026-07-19 revert (owner decision needed)
- [ ] Fix HMR-Astro `README.md` stale claims, bundled with PR #111 merge
- [ ] Review and merge HMR-Astro #111 and HMR-Flutter #27
- [ ] Decide on D1 `hmr-chat-history` and Worker secrets (per PR #111)
- [ ] Fix 15 `astro check` errors in `Layout.astro` (outstanding 1+ cycle)
- [ ] Confirm Drive access to `HMR-Private → To Do`

## Evidence

All checks executed 2026-07-20 against production and repos.
- FACTS.md/SUPERVISOR.md from wikigoo/HMR-Ops main
- STATE.md from wikigoo/HMR-VPS main (snapshot 2026-07-19T22:58:15Z)
- Endpoint checks via curl; /ai content fingerprint
- PR/workflow checks for all 6 repos
- Commit history audit, backup workflow status
- Docs staleness scan of HMR-Astro
- Drive search for To-Do tracker (zero results)
