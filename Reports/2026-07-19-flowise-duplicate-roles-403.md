---
title: "2026-07-19 — Flowise admin 403 /unauthorized: duplicate general roles from the SQLite→Postgres migration"
description: "The owner could log in to srv.hmrbot.com but was redirected to /unauthorized. Root cause: the 2026-07-15 SQLite→Postgres row-copy left the role table with duplicate general roles, breaking Flowise auth resolution. Fixed by deleting the 3 unreferenced duplicates."
---

# 2026-07-19 — Flowise admin 403 `/unauthorized`

**Audience:** the next AI session working on HMR, and the project owner.
**Scope:** diagnosis and fix of a login-authorization failure on `srv.hmrbot.com` (Flowise admin).
Every claim below was verified against live production (Postgres + the pre-migration SQLite backup).

---

## Symptom

The owner (`wikigoo58@gmail.com`) reported that `https://srv.hmrbot.com/` and the raw IP
`5.75.207.85` "failed with 403 Forbidden — You do not have permission to access this page."

First read was a network/Cloudflare/filtering hypothesis — **wrong.** Screenshots showed the
sign-in page loading fine, and the 403 appearing **only after** submitting valid credentials, at
the URL `srv.hmrbot.com/unauthorized`. That page (rocket illustration, "403 Forbidden — You do not
have permission to access this page") is Flowise's own client-side route. So:

> Authentication succeeded (password correct); **authorization (RBAC) failed** → redirect to
> `/unauthorized`. Not a network, Cloudflare, nginx, or password problem.

The site was healthy the whole time — `hmrbot.com`, `srv.hmrbot.com`, and the origin all returned
200 from an external vantage point; only the post-login RBAC step failed.

## Root cause

The `role` table in the Flowise Postgres DB held **duplicate general roles**:

| role | original (from SQLite) | duplicate (created during migration) |
|---|---|---|
| owner | `abc96cea…` — created 2026-06-18 | `2a761a85…` — created 2026-07-15 13:58 |
| member | `f97dbb2a…` — 2026-06-18 | `1ca143d5…` — 2026-07-15 13:58 |
| personal workspace | `f85436a0…` — 2026-06-18 | `63359b76…` — 2026-07-15 13:58 |

During the **2026-07-15 SQLite→Postgres migration**, Flowise booted on an empty Postgres and
**auto-seeded its 3 default general roles** (13:58:22). The one-shot Python row-copy script then
inserted the 3 original roles (with their 2026-06-18 ids/dates) **on top** → 6 roles total.

The owner's `organization_user` and `workspace_user` rows both point to the **original** owner role
(`abc96cea…`). But Flowise's `POST /api/v1/auth/resolve` expects each general role name to be
**unique**; with duplicates present, role/permission resolution fails and the user is treated as
unauthorized.

### Proof (backup diff)

The pre-migration SQLite backup (`/root/.flowise/database.sqlite`, the state when login worked)
contains the **identical** user / organization / workspace / `organization_user` / `workspace_user`
rows — but only **3 roles**. The sole difference between the working state and the broken state was
the **3 duplicate roles**. The duplicate set (2026-07-15) was referenced by **0** `organization_user`
and **0** `workspace_user` rows. The whole install has exactly 1 user, 1 org, 1 workspace, and 0
org-scoped custom roles.

## Fix

Executed on the VPS with explicit owner confirmation (production DB write):

1. Backed up the `role` table → `/root/role_backup_20260719.sql` (`pg_dump --data-only`).
2. Deleted the 3 unreferenced duplicate roles:
   ```sql
   DELETE FROM role WHERE id IN (
     '2a761a85-fdc5-4339-8cf0-98927e7f4e6b',  -- owner (dup)
     '1ca143d5-eaae-4f25-8513-eea21d62f9b0',  -- member (dup)
     '63359b76-6011-476e-abb8-7c943dd1c11e'   -- personal workspace (dup)
   );
   ```
   Result: `DELETE 3`; role table now holds exactly the original 3 roles — matching the known-good
   SQLite topology.
3. Restarted the Flowise container (`docker compose restart flowise`) → returned to `healthy`.
4. Owner cleared cookies / used a fresh session and confirmed login now works — no more
   `/unauthorized`.

Cookie clearing mattered: the pre-fix JWT was minted against the broken role state; a fresh login
mints a clean token.

## Rollback (available, unused)

- `/root/role_backup_20260719.sql` re-inserts the deleted rows.
- Pre-migration SQLite backups remain (`/root/.flowise/database.sqlite`,
  `/root/.flowise.bak.precutover.1784123880/`).
- Ultimate rollback: flip `DATABASE_TYPE` back to unset (→ sqlite).

## Open items

- **Migration hygiene (recorded in `HMR-Ops/FACTS.md`).** Any future Flowise DB migration via
  row-copy must **de-duplicate the `role` table** afterward — Flowise auto-seeds its own general
  roles on first boot of an empty DB, so a copy that also brings the originals produces duplicates
  that silently break auth resolution.

## Evidence

- Live Postgres (`docker exec docker-postgres-1 psql -U flowise -d flowise`) and the SQLite backup
  (`docker exec docker-flowise-1 sqlite3 /root/.flowise/database.sqlite`), 2026-07-19.
- Flowise request log `/root/.flowise/logs/server-requests.log.jsonl` showed repeated
  `POST /api/v1/auth/login` + `/api/v1/auth/resolve` hits from the owner.
- Fix executed and verified 2026-07-19 ~14:40 UTC; `srv.hmrbot.com/signin` and `/api/v1/ping` = 200.
