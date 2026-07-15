---
title: HMR-Knowledge-Base-Architecture
description: "How HMR applies knowledge-base engineering principles to its real six-repo system — an HMR-specific rewrite of the generic KB guide."
---

# HMR Knowledge-Base Architecture

**HMR-specific adaptation of the generic "Building a Knowledge Base for an AI Chatbot" guide.**
This document maps the general RAG/KB principles onto HMR's real components. Where the generic guide
prescribes files to *create* (`AGENTS.md`, `PICKUP.md`, folders), HMR already has equivalents that are
*live sources of truth* — this doc names them so no one reinvents a parallel structure.

> Canonical facts live in `HMR-Ops/FACTS.md`; the operating contract in `HMR-Ops/SUPERVISOR.md`;
> live server state in `HMR-VPS/STATE.md`. If this doc ever disagrees with those, **they win.**

---

## 1. Why HMR is built this way

HMR is a RAG-grounded advisor for the Persian-speaking Iranian mobile-hardware market — it never
relies on the model's static memory for facts, specs, or prices. Two failure modes the generic guide
names are already solved in HMR:

- **The Chat Trap / Cold Start** — HMR never keeps project state in a chat thread. State lives in
  `FACTS.md` (durable facts), `STATE.md` (nightly server snapshot), and the **Google Drive To-Do**
  (`HMR-Private → To Do`, the live action list). Any agent resumes from these, not from conversation.
- **Context Overload** — HMR does not dump everything into one context. Retrieval facts, product
  facts, and per-brand corpora are physically separated across repos (see §2).

The KB is **platform-agnostic plain files in Git** — the same property the generic guide praises. If
the AI stack changes, the whole knowledge base survives untouched.

## 2. HMR's KB structure: the six repos

The generic guide's single `ai-chatbot-knowledge-base/` folder is, for HMR, a **set of six repos**.
Read this as the canonical folder hierarchy — the "mental map" an agent learns once.

| Generic KB concept | HMR reality |
|---|---|
| `01_context/` (project memory) | **`HMR-Ops/FACTS.md`** + **`HMR-Book`** (docs repo, git-only) |
| RAG corpora (the retrieved knowledge) | **`HMR-RAG`** — Apple / Samsung / Xiaomi corpora |
| `02_skills/` (compounding patterns) | **`HMR-Ops`** — supervisor charter, `skills/`, `agents/` |
| `03_execution/` (active heartbeat) | **Google Drive To-Do** + `HMR-Book/Reports/` |
| `04_product/` (final deliverables) | The live product: **`HMR-Astro`** (site), **`HMR-Flutter`** (app) |
| `05_constraints/` (guardrails) | `SUPERVISOR.md` — global rules + authority matrix |
| Design system | **`HMR-Design`** (Claude Design) |
| Infra as code + live state | **`HMR-VPS`** — Docker Compose, nginx, deploy/backup, **`STATE.md`** |
| `99_archive/` (historical vault) | Deprecated notes kept *in* FACTS.md (e.g. the retired monorepo `wikigoo/HMR`, the old Hetzner box) |

The old monorepo `wikigoo/HMR` **no longer exists** — any doc pointing to it is stale (this is HMR's
"archive" discipline in action: the fact is recorded, not silently deleted).

## 3. Core files — HMR's equivalents of AGENTS.md / PICKUP.md / DEPENDENCIES.md

The generic guide's three root files each have a live HMR counterpart. **Do not create the generic
files** — use these:

| Generic file | HMR equivalent | Role |
|---|---|---|
| `AGENTS.md` (behavioral constraints) | **`HMR-Ops/SUPERVISOR.md`** | Role, authority matrix, model routing, global product rules |
| `foundation.md` (Layer-0 identity) | **`FACTS.md` → "What HMR is"** | Five pillars, advisor-not-decision-maker |
| `DEPENDENCIES.md` (external variables) | **`FACTS.md` → Backend / Auth / Endpoints** | VPS, Flowise, SearXNG, OpenRouter models, Google Sign-In |
| `PICKUP.md` (session handoff) | **`STATE.md` (nightly) + Drive To-Do** | Where the server stands + what's pending |

**Boot sequence** (every HMR session): read `FACTS.md`, then `STATE.md`, then the Drive To-Do — *only
then act*. If a source is unreachable, say so plainly; never invent project state. This is HMR's
enforced version of "read the routing files first."

## 4. Content rules for HMR

- **Single-topic chunking** applies to `HMR-RAG`: each corpus is per-brand (Apple / Samsung / Xiaomi),
  and within it, discrete phone/topic files — never one sprawling manual. This keeps embeddings dense
  and retrieval precise. Embeddings: `openai/text-embedding-3-large`; reranker
  `google/semantic-ranker-default-004`.
- **Grounding = HMR's non-negotiables.** The generic "never hallucinate" rule is HMR's:
  - *Honesty* — never fabricate specs, prices, or project state.
  - *Live-price-only* — prices come from live sources (SearXNG web search), never model memory.
  - *Advisory, not decisional* — for the chatbot **and** for any supervising agent.
- **Attribution / no conflicting guidance** — when two docs disagree, the hierarchy resolves it:
  `STATE.md` > `FACTS.md` > any other doc; `SUPERVISOR.md` overrides local agent memory. Fix stale
  docs on sight (this is the standing docs-sync duty).
- **Output language split** — end-user output in **Persian** (RTL, Jalali dates); manuals, docs, and
  code in **English**. This document follows that rule.

## 5. Naming conventions

- **Dates in docs:** `YYYYMMDD` (or ISO `YYYY-MM-DD`) so files sort chronologically. **End-user dates
  are Jalali** — the two conventions do not mix.
- **Reports:** `HMR-Book/Reports/YYYY-MM-DD-<topic>.md` — `.md`, not `.mdx`; follow the files already
  in that directory.
- **No parallel trackers in Git.** The live action list is the Drive To-Do only; do not recreate a
  `next-actions` page in the repo (one was created and deliberately deleted by the owner).

## 6. Maintenance — beating the Stale Cascade

Documentation debt is a first-class bug. HMR's maintenance model:

- **Docs-sync duty (standing task):** whenever you touch a repo, check its README/CLAUDE.md/docs
  against reality (`FACTS.md`, `STATE.md`, the code). Stale claim → fix it: docs repos directly,
  code repos via PR.
- **`FACTS.md` changes go via PR** — never let an agent's local memory disagree with it. When reality
  changes, the file changes; local memory holds only personal preferences.
- **Nightly automation:** archive → Telegram, plus a fresh `STATE.md` / flow-JSON snapshot committed to
  `HMR-VPS`. The KB refreshes itself so "the passage of time" doesn't rot it.
- **Corrective feedback loop:** a wrong answer triggers an edit to the *source* (the RAG chunk or
  `FACTS.md`), not a one-off chat correction. (Real example: the "auth is via Firebase" error lived in
  `FACTS.md` and propagated until the source was corrected on 2026-07-14 — there is no Firebase Auth.)

## 7. Tooling — HMR's actual stack

The generic guide suggests AnythingLLM / Obsidian for a local RAG. HMR's production stack is different
and specific:

- **Retrieval + orchestration:** **Flowise** (`flowiseai/flowise:3.1.3`, localhost:3000) running the
  production chatflow **`HMR-Agentflows-v2`**. `v3` and `Supervisor Worker Agents` are DB experiments,
  not production.
- **Web search grounding:** **SearXNG** (`http://searxng:8080`, internal) — only bing/qwant/mojeek
  work from the datacenter IP.
- **Models via OpenRouter:** LLM `gemini-3.1-flash-lite`. (OpenRouter serves no embedding models —
  embeddings use their native provider credential.)
- **Reverse proxy:** nginx injects the Flowise API key server-side (`/etc/nginx/hmr-auth.conf`) — **no
  client ever carries a secret.**
- **Authoring the KB locally:** the repos are edited as an **Obsidian** vault (this workspace is one),
  which gives the generic guide's wikilink graph over the Markdown corpora for free.

## 8. Quick reference — what maps to what

| You want to… | Read / edit |
|---|---|
| Know what HMR is / its backend | `FACTS.md` |
| Know the rules & who can do what | `SUPERVISOR.md` |
| Know the live server state | `HMR-VPS/STATE.md` (nightly) |
| Know what's pending | Google Drive → `HMR-Private → To Do` |
| Improve retrieval answers | `HMR-RAG` corpora (Apple/Samsung/Xiaomi) |
| Write a status report | `HMR-Book/Reports/YYYY-MM-DD-<topic>.md` |
| Change infra (deploys on merge!) | `HMR-VPS` — **PR only, human merges** |

---

*Source of this adaptation: the generic guide `RAG/Knowledge-base-structure-on-PC.md`, rewritten
against `HMR-Ops/FACTS.md` and `HMR-Ops/SUPERVISOR.md` (last reviewed 2026-07-14).*
