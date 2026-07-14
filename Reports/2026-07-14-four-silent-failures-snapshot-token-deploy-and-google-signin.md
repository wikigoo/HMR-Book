---
title: "2026-07-14 — Four silent failures: snapshot, leaked token, broken deploy, and Google Sign-In"
description: "Technical incident and remediation report. Four independent production defects, all of which failed silently. Root causes, evidence, fixes, verification, and the durable facts a future session needs."
---

# 2026-07-14 — Four silent failures: snapshot, leaked token, broken deploy, and Google Sign-In

**Audience:** the next AI session working on HMR, and the project owner.
**Scope:** everything diagnosed and changed on 2026-07-14. Every claim below was verified;
where something was *not* verified, it says so.

> **The pattern, if you read nothing else.** All four defects were **silent**. A snapshot job wrote
> `?` and exited 0. A secret-scan rule contained the secret it scanned for. A deploy died before it
> touched anything, so nothing looked broken. A `catch` block reported an OAuth misconfiguration as
> "check your internet connection." None of them announced themselves. Three of the four had existed
> since the 2026-07-13 VPS migration and were only found because something *else* forced a look.
> **When you touch HMR infrastructure, assume failures are being swallowed until you prove otherwise.**

---

## 1. Nightly snapshot was writing a hollow `STATE.md`

**Symptom.** `STATE.md` in `wikigoo/HMR-VPS` showed `?` for every Flowise count
(`chat_flow`, `document_store`, `tool`, `assistant`, `credential`, `variable`), the Flows and
Document-stores tables were empty, and `flowise/flows/` had no exported JSON. The job nonetheless
exited 0 and committed successfully every night.

**Root cause.** `scripts/snapshot_state.sh` shells out to the **`sqlite3` CLI**, which is **not
installed** on the new Server.ir box. Every call failed. The `count()` helper was written as:

```sh
count() { sqlite3 "$SQL" "SELECT count(*) FROM $1;" 2>/dev/null || echo "?"; }
```

so each failure was swallowed and rendered as `?`. The flow-export loop iterated over an empty
`SELECT id FROM chat_flow`, so it exported nothing. `du -h` on the DB file still worked, which is why
"DB size 9.2M" looked healthy and masked the problem.

**Evidence.** Read-only SSH probe of `root@5.75.207.85`: `which sqlite3` → missing; `python3` present
at `/usr/bin/python3` with a working stdlib `sqlite3` (3.45.1); the DB at
`/root/.flowise/database.sqlite` (9.6 MB) read fine read-only and contained 3 `chat_flow` rows. No
`-wal`/`-shm` files existed, which ruled out a DB-lock explanation.

**Fix — [HMR-VPS PR #6](https://github.com/wikigoo/HMR-VPS/pull/6) (merged).**
All DB access moved to `python3` + stdlib `sqlite3`, opened strictly read-only via
`sqlite3.connect("file:/root/.flowise/database.sqlite?mode=ro", uri=True)` so the snapshot can never
mutate or lock the live Flowise DB. **The `|| echo "?"` anti-pattern is gone:** any DB failure now
prints `FATAL:` to stderr and exits non-zero, which fails the GitHub Action instead of committing a
hollow snapshot. The flow-JSON redactor and the masked `.env` output were preserved unchanged.

**Status.** Merged, but **live verification is still open** — the workflow has not run since
2026-07-13T23:00, so `STATE.md` on `main` still shows `?`. Run `state-snapshot.yml` via
`workflow_dispatch`. Expect real counts and all three flows. If the fix is wrong, the job now goes
**red** rather than silently committing garbage; that loud failure is the point.

---

## 2. The live prediction token was committed in the repo

**Symptom.** None. This was found by reading `.github/workflows/state-snapshot.yml` while working on
incident #1.

**Root cause.** The workflow's `Secret scan` step hard-coded the **real** nginx prediction token in
plaintext as a grep pattern. The anti-leak rule was itself the leak.

**Evidence that it was live, not stale.** On the server, the Bearer value inside
`/etc/nginx/hmr-auth.conf` was compared to the DB (boolean comparison only — the value was never
printed): it matched `apikey.apiKey` of the Flowise key named **`nginx-proxy`**, and the production
chatflow `HMR-Agentflows-v2` was bound to exactly that key (`chat_flow.apikeyid`). So the committed
string was the working production credential.

`HMR-VPS` is a **private** repo, so there was no public exposure — but this still violates the
charter's *secrets are never committed* rule.

**Rotation (owner-authorised, completed and verified).**

1. Owner created a new Flowise key **`nginx-proxy-2`** in the Flowise admin panel and rebound the
   production chatflow to it. *This step was deliberately left to the owner:* Flowise stores
   `apiSecret` as a PBKDF2 `hash.salt` (145 chars), so forging a valid key row by direct DB insert
   would mean reproducing Flowise's exact hashing parameters — a wrong guess would 401 production.
   Rebinding in the UI also lets Flowise invalidate its own in-memory cache, avoiding a restart.
2. `/etc/nginx/hmr-auth.conf` was backed up, then rewritten with the new key read **server-side**
   straight from the DB (mode 600, still out of git, value never printed or transported).
3. `nginx -t` passed; nginx reloaded.
4. Verified end-to-end: an **unauthenticated** POST to the public prediction endpoint (exactly what a
   real client sends — clients carry no token) returned **HTTP 200** with a valid Persian reply.
5. Owner deleted the old `nginx-proxy` key; verified absent from the `apikey` table.
6. The rollback backup was shredded after confirming the key it held was dead.

> **Note on ordering:** because the owner rebound the chatflow *before* nginx was updated, production
> chat was almost certainly returning 401 in the window between those two steps. If you ever repeat
> this: rebind and update nginx as close together as possible, or keep both keys valid until nginx is
> switched.

**Fix — [HMR-VPS PR #9](https://github.com/wikigoo/HMR-VPS/pull/9) (merged).** The exact-match rule
was replaced with generic patterns — `Bearer <token>`, `proxy_set_header Authorization`, and a raw
43-char Flowise API key in JSON. **No secret needs to live in the repo at all — not even as an Actions
secret** — and future tokens are covered too.

**Git history.** The old value is still in history. That is **fine and requires no rewrite**, because
the key was rotated and is now dead. Rotation is what makes history exposure moot — this is why
"just delete the line" would have been the wrong fix.

---

## 3. Every production deploy had been failing since the migration

**Symptom.** Both `Deploy to VPS` runs on 2026-07-14 (08:10 and 09:58 UTC) failed. These were the
first two runs since the 2026-07-13 migration — the workflow only triggers on non-snapshot pushes to
`main`, and none had happened until today's merges.

**Root cause.** Verbatim from the run log:

```
cp: '***/nginx/sites-available/hmrbot.conf' and '/etc/nginx/sites-enabled/flowise' are the same file
```

On the new box, `/etc/nginx/sites-enabled/flowise` was a symlink pointing **straight into the git
checkout** (`/opt/hmr-vps/nginx/sites-available/hmrbot.conf`), and `/etc/nginx/sites-available/`
contained no `hmrbot.conf` of its own. Step 4 of `deploy.yml` did
`cp "$REPO/nginx/sites-available/hmrbot.conf" "$SITE"` — a self-copy. `cp` refused, and
`set -euo pipefail` aborted the deploy.

**Impact.** Production was **never broken** — the script died before touching nginx. But **no config
change had actually deployed since the migration.**

**Fix — [HMR-VPS PR #10](https://github.com/wikigoo/HMR-VPS/pull/10) (merged).** Step 4 is now
idempotent and self-healing:

- `install -m 644` the repo config to a **real file** at `/etc/nginx/sites-available/hmrbot.conf`
  (never `cp` onto the symlink);
- `ln -sfn` `/etc/nginx/sites-enabled/flowise` at that real file, replacing the stale
  symlink-into-checkout;
- backup/rollback now operates on the real file, not through the symlink (the old rollback would have
  written back into the git working tree);
- if the very first (self-healing) run fails `nginx -t`, the original symlink target is restored, so a
  later manual `nginx -s reload` cannot pick up a config that just failed validation.

This intentionally **decouples the live nginx config from the git working tree** — a bad checkout can
no longer silently become the running config.

**Verified after merge.** The triggered deploy **succeeded** — the first successful HMR-VPS deploy
since the migration. On the server: `sites-enabled/flowise` → `/etc/nginx/sites-available/hmrbot.conf`
(real file, 3673 bytes), `include /etc/nginx/hmr-auth.conf` intact, `nginx -t` passes, and a live
prediction request returned **HTTP 200**.

---

## 4. Google Sign-In was broken on the web

**Symptom.** Owner reported Google login failing. Initially reported as failing in *both* the Android
app and the web chat; it turned out Android was fine.

**One root cause, two symptoms.** In `lib/providers/auth_provider.dart`, `init()` skipped
`signInSilently()` on web:

```dart
// On web, signInSilently() triggers FedCM which rejects with
// NetworkError on every page load, causing a logout+retry loop.
if (!kIsWeb) { _user = await _googleSignIn.signInSilently(); }
```

**That guard was based on a fear that does not hold.** Reading the installed plugin source
(`google_sign_in_web` 0.12.4+4), `signInSilently()` defaults to `suppressErrors: true` and resolves a
rejected One-Tap/FedCM prompt to `null` rather than throwing. It cannot loop.

The skip caused two things:

1. **Sign-in failed.** With `signInSilently()` never running, the plugin's `_lastCredentialResponse`
   was always `null`. In that state `signIn()` adds People API scopes and synthesizes the profile via
   `https://content-people.googleapis.com/v1/people/me` (`gis_client.dart:343`, `people.dart`). The
   **People API was disabled** in Google Cloud project `ir-hmrbot-app`, so that request failed.
2. **Session never persisted.** `signInSilently()` is the *only* session-restore mechanism GIS offers
   on the web, so even once sign-in worked, every page reload logged the user out.

**Why it went undiagnosed for so long.** `signInWithGoogle()`'s `catch` swallowed **every** exception
and always set the Persian message *"login failed, please check your internet connection."* An OAuth
configuration error was being reported to users as a network fault.

**Evidence.**
- Google Cloud → API Library: People API showed an **Enable** button (i.e. disabled).
- Google Cloud → Audience: **"0 users / 100 user cap"** — nobody had *ever* completed a sign-in.
- Rendering the official GIS button on the live page succeeded with no origin error, which **ruled
  out** an unauthorised-JavaScript-origin cause; `https://hmrbot.com` is correctly registered on web
  client `829078792642-s6gj…`.
- Android was never affected: it uses native GMS and needs no People API. Its release SHA-1
  (`2D:5B:3E:9A:…`, computed from the release keystore) **already matched** the registered Android
  OAuth client `829078792642-og77…`. The `CLAUDE.md` item claiming SHA registration was still pending
  was **stale** and has been corrected.

**Fix.**
- People API **enabled** in `ir-hmrbot-app` (owner-authorised).
- Web path migrated off the deprecated `signIn()` to the GIS **`renderButton`**
  (`package:google_sign_in_web/web_only.dart`), behind a conditional export so `dart:ui_web` never
  reaches the Android build. `signInSilently()` re-enabled on web. The swallowing `catch` now reports
  truthfully and sends the real exception to Sentry / `debugPrint`.
- A re-entrancy guard was added to `init()`: `_initialized` only flips at the *end* of `init()`, but
  `init()` awaits in the middle and **both** `ConversationsScreen` and `HomeShell` call
  `if (!initialized) init()` — a second caller could slip into the async gap and double-subscribe the
  `onCurrentUserChanged` stream. The subscription is now idempotent and cancelled in `dispose()`.

Commits: HMR-Flutter `e95e365`, `7819f79` (plus `c4c2164` clearing pre-existing `flutter analyze`
debt). `flutter analyze` clean; `flutter build web --release` and `flutter build appbundle --release`
both pass. Shipped via the `Deploy Flutter Web to /ai` workflow; owner confirmed web login now works.

**Standing rule:** if web login breaks again, **check that the People API is still enabled before
anything else** — and do not reintroduce the `if (!kIsWeb)` skip around `signInSilently()`.

---

## Durable facts confirmed today

Corrections already landed in `HMR-Ops/FACTS.md` (PR #3) and `HMR-Flutter/CLAUDE.md` (`81f3833`).

| Fact | Value |
|---|---|
| Auth stack | **Google Identity Services** via the `google_sign_in` plugin. **There is no `firebase_auth`/`firebase_core` in HMR-Flutter.** The old "via Firebase" claim was wrong. |
| Web sign-in dependency | Requires the **People API** enabled in `ir-hmrbot-app` while the profile is synthesised through it. `renderButton` + `signInSilently()` is the supported path. |
| Android OAuth | Release keystore SHA-1 `2D:5B:3E:9A:…` → Android OAuth client `829078792642-og77…`. Registered and working. |
| Web OAuth client | `829078792642-s6gj…` ("HMR Web"); `https://hmrbot.com` is an authorised origin. Set via `<meta name="google-signin-client_id">` in `web/index.html`. |
| Server repo checkout | `/opt/hmr-vps` (this is `secrets.PROJECT_PATH`) |
| nginx live config | `/etc/nginx/sites-enabled/flowise` → symlink → `/etc/nginx/sites-available/hmrbot.conf` (a real file, installed by the deploy) |
| Server-only auth header | `/etc/nginx/hmr-auth.conf`, mode 600, **never in git**. Clients (web and Android) carry **no** token — nginx injects it. |
| Flowise key in use | `nginx-proxy-2` (the old `nginx-proxy` is deleted) |
| SSH to the new VPS | `ssh -i ~/.ssh/hmr4vps root@5.75.207.85`. **The `hmrbot-server` alias in `~/.ssh/config` still points at the OLD box (`91.107.159.48`).** |
| Tooling on the VPS | `sqlite3` CLI is **absent**. `python3` + stdlib `sqlite3` (3.45.1) is present — use it. |
| Flowise chatflows | 3 rows: `HMR-Agentflows-v2` (production, `isPublic=0`), `HMR-Agentflows-v3`, `Supervisor Worker Agents.json` |
| Deploy trigger | Any push to HMR-VPS `main` **except** `flowise/flows/**` and `STATE.md` triggers `deploy.yml`, which deploys to production. Merging a PR **is** a deploy. |
| HMR-Book | Git-only docs repo. **No published site** (book.hmrbot.com was removed by the owner on 2026-07-14) and **no workflows**. Reports live in `Reports/` at the repo root, as **`.md`** files. |

---

## Process notes for the next session

- **`SUPERVISOR.md` file-extension drift.** It says reports are `.mdx`; the owner renamed everything in
  `Reports/` to `.md` on 2026-07-14. Follow the directory, and fix the charter.
- **HMR-VPS merges are deploys.** The charter says *"human merges. No exceptions."* Both merges done by
  the agent today (#9, #10) were **explicit owner overrides given in chat** — not agent discretion.
- **Don't over-trust a session summary.** A pasted summary from the previous session claimed "two
  pending pushes." Verification showed all six clones clean and in sync with `origin/main` — there were
  none. Check the repos, not the narrative.
- **Docs can be worse than stale — they can be actively wrong.** `FACTS.md` didn't merely misstate the
  auth stack; it *instructed agents* to "fix on sight" any doc describing the auth as "Firebase-free",
  which was the **correct** description. A confidently-worded wrong rule propagates itself. Treat
  imperative claims in docs with the same suspicion as factual ones.
- **Verify with the narrowest possible probe.** Comparing the nginx Bearer to the DB key was done as a
  boolean; the secret was never printed, transported, or written anywhere. Prefer this shape.

## Open items

1. **Verify the snapshot fix live** — run `state-snapshot.yml` (`workflow_dispatch`). `STATE.md` still
   shows `?` because the workflow hasn't run since the fix merged.
2. **RAG corpus is ~99% Apple** — apple **757** docs vs samsung **3** vs xiaomi **2** (from `INDEX.md`).
   For a bot whose remit is three brands, this is the largest open quality gap. Also: 622 legacy files
   lack frontmatter; Flowise re-upsert isn't wired.
3. `OPENROUTER_API_KEY` secret missing in HMR-Astro — the Blog Auto-Generator has never run successfully.
4. Declare `userinfo.email` / `userinfo.profile` on the OAuth consent screen (Data Access currently shows
   no scopes at all).
5. Decommission the old VPS (`91.107.159.48`); then delete the stale `hmr-vps-server` deploy key, clean
   `authorized_keys`, and repoint the local `hmrbot-server` SSH alias.
6. Disable `PasswordAuthentication` on the new VPS.
7. Refresh logos/icons/avatar/favicon across the app, Flutter web, and site.
8. Keystore rotation + Play App Signing enrolment (still genuinely pending; needs Play Console).
