---
title: Next Actions — Open Items & Blockers
description: Living tracker of open actions, blockers, and completed items. Newest items on top, each dated and marked with status. Evidence cited for each.
---

A single living page of actions, blockers, and completed work. Newest items on top. Status values:
`open` (not started) · `in-progress` (underway, awaiting external or human action) · `done` (completed).
Each item cites its evidence.

---

## Open & In-Progress

### Verify the snapshot fix live
**Status:** `open` (2026-07-14)  
**Evidence:** PR #6 is merged, but `STATE.md` on `main` still shows `?` for every Flowise count — the
snapshot workflow has not run since 2026-07-13T23:00  
**Detail:** Run `state-snapshot.yml` via `workflow_dispatch`. Expected: real counts and all three flows
(`HMR-Agentflows-v2`, `HMR-Agentflows-v3`, `Supervisor Worker Agents.json`). If the fix is wrong the job
now goes **red** instead of silently committing a hollow snapshot — that loud failure is the point of the fix.

### RAG corpus is ~99% Apple
**Status:** `open` (2026-07-14)  
**Evidence:** INDEX.md audit from the 2026-07-13 session report (apple **757** vs samsung **3** vs xiaomi **2**)  
**Detail:** Samsung and Xiaomi sources still need to be added to HMR-RAG to balance the corpus. For a bot
whose remit is three brands, this is the largest open quality gap. Also: 622 legacy files lack frontmatter,
casing drifts need normalising, and the Flowise re-upsert is not yet wired.

### Add `OPENROUTER_API_KEY` secret to HMR-Astro
**Status:** `open` (2026-07-14)  
**Evidence:** From the owner's to-do; the Blog Auto-Generator workflow has never run successfully  
**Detail:** Then: 2 auto-generated blog posts/week, plus a skill for generating posts on demand.

### Declare OAuth scopes on the consent screen
**Status:** `open` (2026-07-14)  
**Evidence:** Google Cloud → Data Access for `ir-hmrbot-app` shows "No rows to display" in all three scope categories  
**Detail:** The app requests `email` and `profile`. Declaring `userinfo.email` / `userinfo.profile` explicitly is cleaner and avoids surprises.

### Decommission the old VPS (`91.107.159.48`)
**Status:** `open` (2026-07-14)  
**Evidence:** VPS migration completed 2026-07-13; old box kept as rollback  
**Detail:** When ready: delete the stale `hmr-vps-server` deploy key, remove old `authorized_keys` entries,
and repoint/retire the local `hmrbot-server` SSH alias — it still points at the **old** box; the new box's
key is `~/.ssh/hmr4vps`.

### Disable `PasswordAuthentication` on the new VPS
**Status:** `open` (2026-07-14)  
**Evidence:** SSH key confirmed working on 5.75.207.85  
**Detail:** Final hardening step.

### Remaining UI work
**Status:** `open` (2026-07-14)  
**Evidence:** Owner's to-do  
**Detail:** Refresh logos, icons, avatar and favicon across the HMR app, the Flutter web build, and the site.
(The `/download` page fixes and the `/ai` footer hover in the same to-do section are **already live** —
verified against the running site — and can be struck from the doc.)

---

## Completed

### Google Sign-In was broken on the web
**Status:** `done` (2026-07-14) — fixed, deployed, and confirmed working by the owner  
**Evidence:** Google Cloud showed the **People API disabled** in `ir-hmrbot-app`; the Audience page read "0 users / 100 user cap" — nobody had ever completed a sign-in  
**Detail:** One root cause, not two. `AuthProvider.init()` skipped `signInSilently()` on web, guarding
against a FedCM loop that — on reading the plugin source — **does not exist**: `signInSilently()` defaults
to `suppressErrors: true` and resolves a failed prompt to `null` rather than throwing. With it skipped, the
plugin's `_lastCredentialResponse` was always null, so `signIn()` fell back to synthesising the profile from
the **People API**, which was disabled. A catch-all `catch` then told users "check your internet connection",
so a config error masqueraded as a network fault and went undiagnosed.

That single skip caused **both** symptoms: sign-in failing, and — once it worked — the user being logged out
on every reload, since `signInSilently()` is the only session-restore mechanism GIS offers on the web.

Android was never affected: it uses native GMS, needs no People API, and its release SHA-1 was already
registered (verified — the keystore SHA-1 matches OAuth client `…og77…`). The `CLAUDE.md` item claiming SHA
registration was still pending was stale, and has been corrected.

Fixed by enabling the People API (owner-authorised) and migrating the web path to the GIS `renderButton`
+ `signInSilently()` (HMR-Flutter `e95e365`, `7819f79` — the latter also guards `init()` against re-entry,
which could otherwise double-subscribe the user-changes stream). Shipped via `Deploy Flutter Web to /ai`.

### Every production deploy was failing since the migration
**Status:** `done` (2026-07-14) — [PR #10](https://github.com/wikigoo/HMR-VPS/pull/10) merged; the deploy it triggered succeeded and **self-healed the server**  
**Evidence:** Two `Deploy to VPS` runs failed with `cp: '.../nginx/sites-available/hmrbot.conf' and '/etc/nginx/sites-enabled/flowise' are the same file`; the post-merge run completed successfully  
**Detail:** On the new box, `/etc/nginx/sites-enabled/flowise` was a symlink pointing straight into the git
checkout, so `deploy.yml`'s `cp "$REPO/.../hmrbot.conf" "$SITE"` was a self-copy and aborted under `set -e`.
Broken since the 2026-07-13 migration; it only surfaced today because these were the first non-snapshot
commits to reach `main`. **Production was never broken — the script died before touching nginx — but no
config change had deployed since the migration.** PR #10 makes the step self-healing (install a real file at
`sites-available/hmrbot.conf`, then `ln -sfn` the symlink at it) and fixes a rollback path that previously
wrote back through the symlink into the checkout. Verified on the server afterwards: symlink now points at
`/etc/nginx/sites-available/hmrbot.conf`, `nginx -t` passes, prediction endpoint returns 200.

### Hardcoded prediction token in `state-snapshot.yml` (HMR-VPS)
**Status:** `done` (2026-07-14) — token rotated; [PR #9](https://github.com/wikigoo/HMR-VPS/pull/9) merged; rollback backup shredded  
**Evidence:** The committed value matched `apikey.apiKey` of the `nginx-proxy` key the production chatflow was bound to — it was the **live** token, not a stale one  
**Detail:** The "Secret scan" step hardcoded the real token as a grep pattern, so the anti-leak rule was
itself the leak. PR #9 replaced the exact-match rule with generic bearer/API-key patterns, so no secret
needs to live in this repo at all — not even as an Actions secret.

Rotation: the owner created Flowise key `nginx-proxy-2` and rebound the production chatflow;
`/etc/nginx/hmr-auth.conf` was backed up, rewritten with the new key (mode 600, out of git), nginx tested
and reloaded; an unauthenticated POST to the public prediction endpoint returned **HTTP 200** with a valid
Persian reply. The old `nginx-proxy` key was then deleted from the Flowise panel — verified absent from the
`apikey` table — and the rollback backup was shredded after confirming the key it held was dead.
**Because the key was rotated, the value still in git history is dead; no history rewrite is needed.**

### Nightly snapshot was silently writing a hollow STATE.md
**Status:** `done` (2026-07-14) — [PR #6](https://github.com/wikigoo/HMR-VPS/pull/6) merged by the owner; live verification still open (see above)  
**Evidence:** Every Flowise count in STATE.md rendered as `?`, zero flows exported, yet the job exited 0 and committed nightly  
**Detail:** The `sqlite3` CLI is not installed on the new Server.ir box, and `count()` was written as
`sqlite3 ... || echo "?"`, so every failure was swallowed. Fixed by moving DB access to python3's stdlib
`sqlite3` (read-only, `mode=ro`) and making any DB failure exit non-zero so the Action goes **red** rather
than committing a hollow snapshot. The loud-failure property is the important half of the fix.

### Docs claimed auth ran "via Firebase"
**Status:** `done` (2026-07-14) — [HMR-Ops PR #3](https://github.com/wikigoo/HMR-Ops/pull/3) merged; HMR-Flutter `81f3833` pushed  
**Evidence:** `HMR-Flutter` has no `firebase_auth` / `firebase_core` dependency at all  
**Detail:** Worse than a stale fact: FACTS.md instructed agents to "fix on sight" any doc describing the auth
as "Firebase-free" — which was the **correct** description. The rule actively pushed correct docs toward the
error. Both FACTS.md and HMR-Flutter's CLAUDE.md now say Google Identity Services, and record that web
sign-in depends on the People API staying enabled.

### Close HMR-Book PR #5 ("Add Cloudflare Workers configuration")
**Status:** `done` (2026-07-14)  
**Evidence:** PR #5 closed without merge; HMR-Book now has no open PRs  
**Detail:** Opened by the Cloudflare autoconfig bot. It would have configured a Cloudflare Workers deployment
for book.hmrbot.com — a site the owner removed on 2026-07-14 — so merging it would have re-introduced config
for a deployment that no longer exists. Closed, not merged.

### book.hmrbot.com site removed
**Status:** `done` (2026-07-14)  
**Evidence:** HMR-Book repo audit confirms no `.github/workflows` directory; FACTS.md and SUPERVISOR.md corrected via HMR-Ops PR #2  
**Detail:** HMR-Book is now a git-only docs repo with no published site. SUPERVISOR.md had been pointing
reports at `src/content/docs/reports/`, a path that does not exist; it now points at `Reports/`.
