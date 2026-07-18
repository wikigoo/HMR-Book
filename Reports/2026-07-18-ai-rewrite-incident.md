---
title: "2026-07-18 — /ai rewrite: 500 error, broken login, missing history, and decommissioning the Flutter web build"
description: "Technical incident and remediation report. A same-day deploy of a rewritten /ai page broke production; root cause, fixes for auth and chat history, and formal decommission of the now-orphaned Flutter web build."
---

# 2026-07-18 — /ai rewrite: 500 error, broken login, missing history, and decommissioning the Flutter web build

**Audience:** the next AI session working on HMR, and the project owner.
**Scope:** everything diagnosed and changed on 2026-07-18, across `HMR-Astro`, `HMR-Flutter`,
`HMR-VPS`, and `HMR-Ops`. Every claim below was verified against live production or committed
code; where something still needs a human check, it says so explicitly.

---

## Background: what changed today

Commit `e7d7752` on `HMR-Astro` (pushed 14:01 UTC) rewrote `hmrbot.com/ai` from a **proxy to a
Flutter web build** hosted on the VPS into a **native Astro+React chat UI** rendered directly by
the Cloudflare Worker (`hmrbot-worker`). This single change had four downstream consequences,
each handled below.

## 1. Production 500 on every `/ai` request

**Symptom.** `https://hmrbot.com/ai/` returned HTTP 500 on every request, immediately after the
14:01 deploy.

**Root cause.** The new `src/pages/ai.astro` called `getSession()` from `auth-astro/server` on
every render. That helper reads its `secret` from `import.meta.env.AUTH_SECRET` — a **build-time**
value inlined by Vite. `AUTH_SECRET` was only ever set as a Cloudflare Worker **runtime** secret
(`wrangler secret put`), never as a build-time env var, so `import.meta.env.AUTH_SECRET` was
always `undefined` in the production build. `@auth/core`'s `Auth()` threw `MissingSecret` on
every single request; Astro surfaced it as a full-page 500. Reproduced locally with `wrangler dev`
against a build with no secrets present (matching the real Cloudflare build conditions) —
identical stack trace.

**Fix (commit `0a55dcc`).** `ai.astro` now reads `Astro.locals.user` — the session already
resolved server-side by `src/middleware.ts` from the `hmr_session` cookie (the project's real,
working GIS+JWT session design; see `HMR-Ops/FACTS.md`) — instead of calling `auth-astro`'s
`getSession()`. Zero new type errors, clean `npm run build`, verified 200 on production
afterward.

**Lesson for future sessions:** on Cloudflare Workers, `import.meta.env.X` is a **build-time**
value; Worker runtime secrets must be read via the `cloudflare:workers` `env` import (as
`middleware.ts` already correctly does for `SESSION_SECRET`). Mixing the two silently produces
`undefined` in production with no build-time warning.

## 2. "Sign in" button did nothing

**Symptom.** After the hotfix above, `/ai` loaded correctly, but clicking "ورود شوید" had no
effect.

**Root cause.** `middleware.ts` already implemented the *read* side of a GIS session (verify
`hmr_session`, populate `Astro.locals.user`) and its own comment said the cookie was "minted by
`/api/auth/login`" — but that endpoint never existed in the repo. The only thing under
`src/pages/api/auth/` was `auth-astro`'s catch-all (`[...auth].ts`), which has the same
build-time-secret defect as item 1 above (unexercised in production only because nothing called
it after the hotfix). `.env.example` documented the intended design (`GOOGLE_CLIENT_ID` = Web
OAuth client, `SESSION_SECRET`, both already provisioned as Worker secrets) but nothing
implemented it.

**Fix (commit `c742e9f`).** Built `src/pages/api/auth/login.ts` (verifies the GIS ID token
against Google's JWKS via `jose`'s `createRemoteJWKSet`+`jwtVerify`, checking `iss`/`aud`, mints
the `hmr_session` JWT exactly as `middleware.ts` expects to read it — HS256, `SESSION_SECRET`,
`iss`/`aud`=`hmrbot.com`, 30-day expiry, `httpOnly`/`secure`/`SameSite=Lax` cookie) and
`src/pages/api/auth/logout.ts`. Wired the real Google `renderButton` into `ChatSidebar.jsx`.
**Fully removed** `auth-astro`/`@auth/core` (npm deps, `auth.config.mjs`, the dead catch-all
route) — confirmed via repo-wide grep that nothing else depended on them. `GOOGLE_CLIENT_ID`/
`SESSION_SECRET` were confirmed already present in production via `wrangler secret list`.

## 3. "It logs me in automatically" — audited, not a bug

**Report.** The owner observed being signed in on `/ai` without clicking anything.

**Audit (commit `c6db05a`).** Checked every plausible GIS auto-auth mechanism against Google's
current official docs: `auto_select: false` is explicitly set; `google.accounts.id.prompt()`
(One Tap) is never called anywhere in the codebase; `credential_response.select_by` is never read;
`renderButton`'s own iframe cannot programmatically return a credential per Google's documented
behavior. No hand-rolled/fake Google button exists anywhere in `src/components/chat/`.

**Conclusion:** the `hmr_session` cookie has a 30-day `Max-Age`. A user who clicked "sign in"
once will appear signed in on every later visit in that same browser — standard "remember me"
persistence, not a GIS-level auto-login bug. **Open item:** if the owner reproduces this on a
genuinely first-ever visit (fresh incognito window, zero prior interaction with the site), that
would contradict this audit and needs exact repro steps (browser/OS) to investigate further —
nothing in the shipped code explains that case. Not yet confirmed either way.

## 4. Chat history wasn't saved

**Root cause.** Never built — `ChatSidebar` was passed a hardcoded `history={[]}`.

**Fix (commit `c6db05a`).** New Cloudflare D1 database `hmr-chat-history` (binding `DB`),
`chat_sessions`/`chat_messages` tables. Persisted **server-side** in `src/pages/api/chat.ts`
(survives a client disconnecting mid-stream; partial assistant answers are kept on abort, never
an empty one). Ownership is a real check, not decorative: a `sessionId` already owned by a
different `user_sub` is rejected with 403 (verified with two distinct signed-in identities in
testing). `GET /api/chat/sessions` and `GET /api/chat/sessions/[id]/messages` serve the sidebar.
**By explicit product decision, only signed-in users get persisted history** — guest chat remains
fully ephemeral/in-memory, no client-side storage of any kind added for guests (confirmed: zero
D1 writes for signed-out requests).

## 5. Decommissioning the orphaned Flutter web build

Removing the `/ai` → VPS proxy (step in commit `e7d7752`, item 1's root commit) left an entire
parallel system orphaned: `HMR-Flutter` had a Flutter **web** export (distinct from the Android
app) previously served at this same URL, with its own GIS login code
(`_restoreSessionFromCookie()` calling a `GET /api/auth/session` that, it turns out, **never
existed** on the `HMR-Astro` side either — confirmed 404 in production) and a CI pipeline
publishing it as a GitHub release. `HMR-VPS`'s nginx had a gated `/ai/` location serving that
build from `/var/www/hmr-web/`, reachable only via the now-deleted Worker proxy fetch — i.e.
100% unreachable by any legitimate path the moment `e7d7752` landed.

The owner approved formally decommissioning this (rather than trying to keep it wired to the new
architecture, or just leaving it as an untouched dead end):

- **`HMR-Flutter`** (commit `83f0a0d`, pushed to `main`): deleted `build-web.yml` (the web
  release pipeline), the three web-only GIS button widgets, and every `kIsWeb`-gated auth-restore
  code path in `auth_provider.dart`/`conversations_screen.dart`/`home_shell.dart`. Dropped the
  now-transitive `google_sign_in_web` direct dependency. `flutter analyze` clean before and
  after; `flutter build apk --debug` succeeded. **The Android app itself is completely
  untouched** — separate native `google_sign_in` flow, separate on-device SQLite chat history,
  neither of which ever depended on any of this.
- **`HMR-VPS`** (PR **[#22](https://github.com/wikigoo/HMR-VPS/pull/22)**, not yet merged —
  config changes here always require human merge, per the authority matrix, no exceptions):
  removes the dead `$ai_block`/`cf-worker` gating and the `/var/www/hmr-web/` static-serving
  block from `nginx/sites-available/hmrbot.conf`, replacing both with a single unconditional
  redirect (`/ai*` → `https://hmrbot.com/ai`) so any stray/bookmarked hit to
  `srv.hmrbot.com/ai` still lands somewhere sane. Also deletes `.github/workflows/deploy-web.yml`
  (the matching consumer of the now-dead `HMR-Flutter` `web-latest` release artifact — confirmed
  it had no other purpose). **A human should run `nginx -t` before merging** — no nginx binary
  was available to lint the change in the session that authored the PR.
- **`HMR-Ops`** (PR **[#10](https://github.com/wikigoo/HMR-Ops/pull/10)**, not yet merged —
  `FACTS.md` itself asks for PR-not-direct-push on facts changes): updates the repo table,
  endpoints table, and Auth section to describe the new `/ai` architecture and remove the stale
  "Flutter web build served at `/ai`" claim.

## Open items for the owner

1. **Confirm the auto-login report** (item 3): was it a returning-browser "remember me" case, or
   a genuinely fresh visit? Only the latter needs further code investigation.
2. **Merge `HMR-VPS#22`** after running `nginx -t` (or a staging reload) — not yet merged.
3. **Merge `HMR-Ops#10`** (`FACTS.md` update) — not yet merged.
4. **Do a real click-through** of Google sign-in and chat history on `/ai` with a real account —
   no session in this incident had a way to drive a real OAuth popup interactively; all
   verification was build/local-dev/production-endpoint-shape checks, not a literal human click.
5. **Minor, non-urgent:** `HMR-Flutter`'s `web/` platform scaffold (`index.html`, manifest,
   `sqflite_sw.js`, etc.) was deliberately left in place — deleting it entirely (removing
   `flutter build web` capability from the repo) is a bigger, separate call that wasn't explicitly
   in scope for today's cleanup.
