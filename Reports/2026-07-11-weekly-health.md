---
title: Weekly Health Report (2026-07-11)
description: Automated weekly system health check for HMR infrastructure, endpoints, repositories, and documentation staleness.
---

## Status Summary

| Check | Status | Notes |
|---|---|---|
| Server (containers, disk/DB, backups) | ✅ | Both containers healthy; snapshot fresh (< 48h) |
| Live endpoints | ✅ | All 200 except /ai which 301-redirects to /ai/ (expected trailing-slash redirect, then 200) |
| Repo PRs | ✅ | Zero open PRs across all 6 repos |
| Repo workflows (7-day window) | ⚠️ | One failure: HMR-Astro "Blog Auto-Generator" |
| Docs staleness (HMR-RAG, this week's rotation) | ✅ | No stale claims found |

## Findings

### 1. HMR-Astro: "Blog Auto-Generator" workflow failing

**Run ID:** `28788919962`  
**Timestamp:** 2026-07-06T11:41:28Z  
**Conclusion:** `failure`

This is the only recorded run of this workflow (never succeeded). The workflow log shows:
```
[ERROR] OPENROUTER_API_KEY is required for article generation.
Process completed with exit code 1
```

The workflow's own failure-notification step then also failed with:
```json
{"ok":false,"error_code":404,"description":"Not Found"}
```

**Root cause:** The `OPENROUTER_API_KEY` repository secret appears to be missing or not wired into this workflow. This is a repo secrets/config gap — per charter, agents never touch secrets, so this needs the human owner to add/fix the `OPENROUTER_API_KEY` secret in the HMR-Astro repo settings. The Telegram notification step failure (404 Not Found) suggests a separate issue with that notification step's bot token or chat ID, but the primary blocker is the missing API key.

### 2. No open PRs

Zero pull requests across all 6 repos (HMR-Astro, HMR-Flutter, HMR-VPS, HMR-Book, HMR-RAG, HMR-Design). Nothing is waiting on the owner for merge review this week.

### 3. CI workflow coverage

HMR-RAG and HMR-Design have no CI workflows configured — expected, as they are data/design repositories, not flagged as an issue.

### 4. Server status

The VPS snapshot (from HMR-VPS STATE.md) is timestamped **2026-07-10T23:03:40Z** — within the 48-hour freshness window. Both containers (`docker-flowise-1`, `docker-searxng-1`) are reported healthy. Backup automation is operational:
- **Daily Backup to Telegram** workflow: green as of 2026-07-11T00:57:02Z
- **State Snapshot to Repo** workflow: green as of 2026-07-10T23:03:28Z

## Docs-Staleness Results

**Rotation cycle:** ISO week 28, week % 6 = 4  
**Selected repository this week:** HMR-RAG

**Audit scope:**
- README.md: ✅ reviewed
- CLAUDE.md: not present (expected for data repo)
- docs/: not present (expected for data repo)
- Apple/manifest.json, Samsung/*, Xiaomi/* corpus folders: ✅ reviewed

**Finding:** No stale claims found. The repository's documentation is minimal (mostly raw source material and corpus metadata). Apple corpus metadata shows v1.0, created 2026-06-25, 137 documents, 619 chunks, sourced from gsmarena_specs and apple_support. No documentation contradicts FACTS.md or STATE.md.

## Evidence

- **FACTS.md and SUPERVISOR.md:** Read from `wikigoo/HMR-Ops` (main branch) at runtime
- **STATE.md:** Read from `wikigoo/HMR-VPS` (main branch), snapshot timestamp 2026-07-10T23:03:40Z
- **Endpoint checks:** `curl -s -o /dev/null -w "%{http_code}"` against:
  - https://hmrbot.com
  - https://hmrbot.com/api/health
  - https://srv.hmrbot.com
  - https://book.hmrbot.com
  - https://hmrbot.com/ai
  - Executed 2026-07-11
- **PR/workflow checks:** `gh pr list --repo wikigoo/<repo> --state open` and `gh api repos/wikigoo/<repo>/actions/runs` for all 6 repos, executed 2026-07-11
- **Backup workflow check:** `gh run list --repo wikigoo/HMR-VPS --limit 10`, executed 2026-07-11
- **Failed run details:** `gh run view 28788919962 --repo wikigoo/HMR-Astro --log-failed`, executed 2026-07-11
- **Docs-staleness scan:** Read of HMR-RAG README.md, CLAUDE.md (absent), docs/ (absent), and brand corpus manifests via GitHub API