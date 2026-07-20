---
title: Weekly Health Report (2026-07-20)
description: Automated weekly system health check for HMR infrastructure, endpoints, repositories, and documentation staleness.
---

## Status Summary

| Check | Status | Notes |
|---|---|---|
| Server (containers, disk/DB, backups) | ✅ | All 3 containers healthy; snapshot fresh (< 48h); both backup workflows green |
| Live endpoints | ✅ | All expected endpoints 200; book.hmrbot.com unreachable but expected (removed 2026-07-14) |
| Repo PRs | ⚠️ | 2 open PRs awaiting review (HMR-Astro #111, HMR-Flutter #27) |
| Repo workflows (7-day) | ⚠️ | HMR-Astro CI fails on all runs (pre-existing type-check debt); HMR-RAG transient failure resolved |
| Canonical facts accuracy | 🔴 | FACTS.md out of sync with production (2026-07-19 changes) |

## Key Findings

### 1. CRITICAL: FACTS.md is stale on /ai architecture

FACTS.md claims hmrbot.com/ai runs Astro+React chat with D1 storage. Production now returns Flutter web shell. Verified via direct fetch and PR #111 details.

Cause: 2026-07-19 revertwas never recorded in FACTS.md. The Astro rewrite was deployed then rolled back same day (15:38-15:54 UTC).

### 2. HMR-Astro README is also stale (docs rotation target)

Lists deleted files (ai.astro, chat.astro). Claims /ai backend is Flowise+Astro route (now orphaned). Suggests chat. subdomain redirect (target gone).

### 3. Two PRs awaiting review

- HMR-Astro #111: Remove orphaned Astro chat subsystem (confirmed accurate)
- HMR-Flutter #27: Plain-text assistant bubbles per design

### 4. HMR-Astro CI fails on all recent runs

15 pre-existing astro check type errors in Layout.astro canvas script. Not new regression. Non-required check. Open since 2026-07-19.

### 5-7. Transient failures, dead endpoints, Drive access gap

HMR-RAG failure self-resolved. book.hmrbot.com expected-down. Drive "To Do" tracker unreachable.

## Docs Staleness Scan

Rotation: ISO week 30, 30%6=0 = HMR-Astro
Result: 3 stale claims from /ai revert

## Open Items

- Update FACTS.md /ai architecture (owner decision needed)
- Fix README.md once #111 merges
- Review/merge HMR-Astro #111 and HMR-Flutter #27
- Decide on D1 hmr-chat-history and Worker secrets
- Fix 15 astro check errors (outstanding 1+ cycle)
- Confirm Drive access for future runs

## Evidence

All checks executed 2026-07-20 against production and repos.
