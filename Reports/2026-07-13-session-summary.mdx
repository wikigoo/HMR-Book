---
title: Session Report — Migration, Design SSOT, UI fixes & RAG pipeline (2026-07-13)
description: End-to-end record of the 2026-07-13 working session — VPS migration to Server.ir, design-token SSOT, production fixes for /ai and book.hmrbot.com, download/footer UI, and the new crawl4AI RAG pipeline.
---

A long single-day session. This is the durable record of what changed, why, and what
remains. Evidence: live-verified where noted; PRs and commits linked inline.

## 1. VPS migration — old Hetzner-direct box → Server.ir (`5.75.207.85`)

Migrated the production backend to a new, identical-spec Hetzner-Nuremberg box purchased
through the reseller **Server.ir**. Executed phases 1–9; phase 10 (decommission) deferred.

- **Access/hardening:** key-based SSH (`~/.ssh/hmr4vps`, CI key authorized), `apt upgrade` +
  reboot to kernel 6.8.0-134, `ufw` (22/80/443, IPv4+IPv6). Root password was force-changed
  on first login.
- **Runtime:** Docker 29.6.1 + Compose v5.3.1, nginx 1.24.0.
- **Data transfer:** consistent `sqlite3 .backup` of `~/.flowise` (DB + **encryption.key** +
  faiss RAG + storage) + config (`.env`, compose, searxng, `hmr-auth.conf`, TLS cert) →
  relayed old→local→new via scp. Backups saved under `HMR-Tools/HMR-Backup`.
- **Deploy + verify:** `docker compose up` (both containers healthy); nginx config cloned from
  `/opt/hmr-vps`; end-to-end prediction through nginx returned a correct HMR answer
  (**proves credentials decrypt** — OpenRouter call succeeded) and RAG answered a Samsung
  hardware question.
- **DNS cutover:** owner changed the Cloudflare `srv.hmrbot.com` A record `91.107.159.48` →
  `5.75.207.85` (kept proxied). Verified a unique-token request landed on the **new origin only**.
- **CI re-point:** authorized the CI key on the new box, registered a read-only deploy key,
  cloned `/opt/hmr-vps`, set `VPS_HOST` → new IP. Test-ran Daily Backup + State Snapshot →
  both green (fresh `STATE.md` committed).

Full checklist: `reports/2026-07-13-vps-migration-checklist.mdx`. Rollback (revert the A record)
stays available until phase 10.

## 2. Canonical facts — `HMR-Ops/FACTS.md`

Updated (via PR) for the new server (provider, IPv4/IPv6, migration note), plus new sections
for the **Design SSOT** and the **RAG pipeline** (below).

## 3. Design system as single source of truth

`HMR-Design/tokens/*.css` is now the enforced SSOT for both surfaces.

- **HMR-Astro #101** (merged): `npm run sync:tokens` + a `design-tokens-drift.yml` CI check.
- **HMR-Flutter #17** (merged): `tool/gen_tokens.sh` → generated `lib/theme/app_colors.g.dart`
  (`HmrTokens`); `app_theme.dart` base hues reference it; drift-check CI. (No-op values.)
- **HMR-Flutter #18** (merged): aligned the last drift — `textPrimary` → `#EAF2FF`,
  `textBody` → `#B9C6E4`. Live on `/ai`.
- Guide written: **`HMR-Design/UPDATING-UI.md`** (linked from the README) — exactly how a token
  change reaches the website and the app, with commands and deploy paths.

## 4. Production fixes

- **`hmrbot.com/ai` was 404.** Root cause: the Flutter web bundle (`/var/www/hmr-web`) is
  deployed separately (not part of the data migration). Ran HMR-VPS `deploy-web.yml` → **200**,
  app restored.
- **`book.hmrbot.com` wasn't updating.** Root cause: a **YAML frontmatter error in
  `index.mdx`** (a two-line `description`) broke *every* Cloudflare Workers build, so nothing
  deployed — the last live version was an 18h-old manual `wrangler deploy`. Fixed the YAML →
  builds pass, and the site now **auto-deploys on push** again (no manual deploy needed).

## 5. UI tweaks

- **HMR-Astro #102** (merged, live): `/download` centred; removed «سخت‌افزار» from the subtitle;
  removed the «امکانات اپلیکیشن» heading.
- **HMR-Flutter #19** (merged, live): footer links on `/ai` now highlight on hover
  (brand cyan + underline + pointer cursor).

## 6. RAG knowledge-base pipeline (new)

Decisions: **GitHub stays the source of truth**; crawler runs on **GitHub Actions**, **manual
trigger** only; sources are a hand-editable manifest.

- **HMR-RAG #1** (merged): `sources.yaml` (manifest), `scripts/crawl.py` (crawl4AI 0.9.1),
  `.github/workflows/crawl.yml` ("Crawl sources", `workflow_dispatch`), README.
- Test-ran the action end-to-end; **tuned** the crawler (`excluded_tags`, `word_count_threshold`,
  post-clean) — output is now clean, RAG-ready markdown (no ADVERTISEMENT / hit-counter noise).
- **`hmr-rag-curate` skill** created (also versioned in-repo) and run → generated `INDEX.md`.

### Audit findings (from INDEX.md)

| Finding | Detail |
|---|---|
| Brand imbalance | apple **757** vs samsung **3** vs xiaomi **2** — corpus is ~99% Apple |
| Missing frontmatter | **622** legacy files (chunks/howto) have no `source/brand/category` |
| Casing drift | 759 files under `Apple/` and `Xiaomi/` (non-canonical vs `samsung/`) |
| Residual noise | 198 legacy files; 36 thin; 3 duplicate-source pairs |
| Clean | 0 crawl-errors, 0 mojibake |

Not yet built: changed-only re-upsert into Flowise.

## 7. Outstanding (owner / next)

- 🔴 **Top up the Server.ir wallet** (auto-renew fails before 1405/05/21) and **decommission
  the old server** after the 48–72h grace window.
- Disable `PasswordAuthentication` on the new box; repoint the `hmrbot-server` SSH alias.
- Run `deploy-web` / merge remaining is done; **assets** (logos/icons/favicon) still need source files.
- RAG: add Samsung/Xiaomi sources; normalise folder casing; backfill frontmatter; wire Flowise re-upsert.
- Pre-existing: keystore rotation + Play App Signing; token-in-binary; release SHA fingerprints;
  `OPENROUTER_API_KEY` for the blog auto-generator.

The live remaining-actions tracker is `next-actions.mdx`; the owner's working list lives in a
local `to do.txt`.
