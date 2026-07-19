---
title: "2026-07-19 — HMR-Flutter code-review remediation (CODE_REVIEW.md, Claims 1–5)"
description: "Verified an external code review against HMR-Flutter, then fixed all five correctness/quality findings across three merged PRs (#24 HTTP pooling + dispose-guard, #25 ChatRepository seam, #26 centralized Persian copy). Includes a detailed, execution-ready spec of the remaining (optional) modernization work — go_router / Riverpod / Dio / freezed — for a future session."
---

# 2026-07-19 — HMR-Flutter code-review remediation

**Audience:** the next AI session working on HMR, and the project owner.
**Scope:** an external code-review document (`CODE_REVIEW.md`, owner-supplied) was audited against the
live `HMR-Flutter` codebase, then its findings were fixed. Android app only (`ir.hmrbot.app`); no
backend, VPS, or web change.

**Evidence:** every finding was verified against the actual code before any fix (an `hmr-checker`
audit pass confirmed all 9 review claims matched current code). Each PR gated on
`flutter analyze` → "No issues found!" and `flutter test` → all passing. Boot sources this session:
FACTS.md (reviewed 2026-07-18), STATE.md snapshot 2026-07-18T22:56Z (server healthy, 3 containers
up). No endpoint touched — `_chatflowId`, `_baseUrl`, and the `sessionId` field/signature in
`api_service.dart` are unchanged (invariant #6).

---

## Deliverables (all merged to `main`)

| PR | Branch | Findings | Gate | Merged |
|---|---|---|---|---|
| [#24](https://github.com/wikigoo/HMR-Flutter/pull/24) | `fix/http-client-provider-race` | Claim 1, 3 | `flutter analyze` ✅ | 2026-07-19 11:53 UTC |
| [#25](https://github.com/wikigoo/HMR-Flutter/pull/25) | `fix/chat-repository` | Claim 2, 4 | `analyze` + `test` ✅ | 2026-07-19 12:05 UTC |
| [#26](https://github.com/wikigoo/HMR-Flutter/pull/26) | `fix/centralize-strings` | Claim 5 | `analyze` + `test` ✅ | 2026-07-19 12:35 UTC |

`main` head after merges: `b065e3e`.

## The review, verified

All nine claims in `CODE_REVIEW.md` were checked against current code and found **accurate** (the
review was real, not hypothetical). Five were correctness/quality findings (fixed below); four were
"modernization" suggestions (deferred — see Open items).

## What changed

### PR #24 — HTTP connection pooling + provider dispose-guard
- **Claim 1 (`api_service.dart`):** the client used the static `http.get`/`http.post` helpers, opening
  a fresh TCP/TLS socket per preflight probe, prediction call, and retry. Now a single reused
  `http.Client()`; a `dispose()` closes it. Wire behaviour unchanged (same URL, headers, body,
  `sessionId`).
- **Claim 3 (`chat_provider.dart`):** async methods called `notifyListeners()` after `await`. If the
  user left the chat mid-request the provider was disposed first, so `notifyListeners()` threw
  *"used after being disposed"*. Fixed with a `_disposed` flag + `_safeNotify()` guard on every
  notification, a `dispose()` override, and skipping the post-await `onUpdate` callback once disposed.

### PR #25 — ChatRepository data-access seam
- **Claim 4:** `ChatProvider`/`ConversationsProvider` instantiated `ApiService`/`ChatDatabase`
  directly (untestable). New `lib/repositories/chat_repository.dart` wraps both behind one injectable
  seam (`fetchAiResponse`, `loadMessages`, `saveMessage`, `deleteMessages`, `deleteAllMessages`,
  `hasMessages`), provided **app-scoped** at the root so the pooled HTTP client now lives for the whole
  app (closed once by the root `Provider`'s `dispose`) instead of per open chat — strictly better than
  #24's per-provider ownership.
- **Claim 2:** `conversations_screen`'s ghost-cleanup called `ChatDatabase.instance.fetchMessages`
  directly; now `repo.hasMessages(id)`. The screen's `chat_database` import is gone — the repository is
  the **only** file importing `chat_database`.
- **Payoff:** new `test/chat_provider_test.dart` drives `ChatProvider` end-to-end against an in-memory
  fake repository (no server, no SQLite) — the thing #4 said was impossible.

### PR #26 — centralized Persian copy
- **Claim 5:** Persian UI strings were hardcoded/scattered, and `MaterialApp` falsely declared
  `en_US` support while never being translated. New `lib/l10n/app_strings.dart` is a single copy deck
  (`const` strings + functions for parameterized lines). Every widget/provider/service now references
  `AppStrings.x`, including `ApiService` (which has no `BuildContext`, so a context-based
  `AppLocalizations` could never have reached it). `en_US` dropped from `supportedLocales`; `locale`
  pinned to `fa-IR`. No visible copy changed.
- **Decision (owner-approved):** a centralized copy deck, **not** full `gen-l10n`/`.arb` i18n — HMR is
  deliberately Persian-only (invariant #1), so multi-locale machinery would serve a language that does
  not exist. Only the Jalali month table and the Persian-digit map stay local (locale *data*, not copy).

### Docs-sync (in #25/#26)
`CLAUDE.md` architecture tree updated for `lib/l10n/` and `lib/repositories/`; the ghost-cleanup note
now reflects `ChatRepository.hasMessages`.

---

## Open items — remaining modernization work (optional, deferred)

These are the four "modernization" suggestions from `CODE_REVIEW.md`. None is a bug; each is a
larger, higher-surface migration and an independent architectural decision. **Do not** bundle them —
each deserves its own branch, its own PR, and (for Riverpod especially) an explicit owner decision
before starting. Recommended order is easiest/least-risky first: **freezed → go_router → Dio →
Riverpod**.

### A. `freezed` + `json_serializable` for models — *lowest risk, do first*
- **Why:** `MessageModel` and `ConversationModel` hand-roll `toJson`/`fromJson` and have no
  `copyWith`. `freezed` generates immutable data classes, `copyWith`, equality, and (with
  `json_serializable`) serialization — removing boilerplate and a class of typo bugs.
- **Scope:** `lib/models/message_model.dart`, `lib/models/conversation_model.dart`. Add
  `freezed_annotation` + `json_annotation` (deps) and `freezed` + `build_runner` +
  `json_serializable` (dev-deps). Convert both models to `@freezed`; keep the existing factory names
  (`MessageModel.userMessage`, `.aiMessage`) as static helpers so call sites don't change.
- **Watch out for:** the Persian-digit `timeLabel` getter and the `MessageRole` enum on
  `MessageModel` (keep as custom methods/`@JsonEnum`); `ConversationModel`'s mutable fields
  (`title`/`lastMessage`/`updatedAt` are reassigned in `ConversationsProvider` — freezed classes are
  immutable, so those call sites must switch to `copyWith`, a real change to audit). `encodeList`/
  `decodeList` helpers must be preserved. Requires a `build_runner` codegen step in CI.
- **Effort:** ~half a day. Gate: `flutter analyze` + `flutter test` + the codegen build.

### B. `go_router` for navigation — *low/medium risk*
- **Why:** navigation is imperative `Navigator.push` (see `conversations_screen._openConversation`).
  `go_router` gives declarative routes and real deep-linking.
- **Scope:** small — there are effectively two surfaces (`HomeShell`/conversations list and
  `ChatScreen`). Define a `GoRouter` with routes `/` (HomeShell) and `/chat/:conversationId`; move the
  per-route `ChangeNotifierProvider<ChatProvider>` creation into the route builder.
- **Watch out for:** the desktop shell (`home_shell.dart`) does **not** use `Navigator` — it swaps the
  chat pane by `ValueKey(_activeId)` inside a single screen. go_router should govern the **mobile**
  push flow only; don't force the desktop two-pane layout through the router or you'll regress it.
  The ghost-conversation cleanup currently runs after `await Navigator.push(...)` returns — with
  go_router that "returned from chat" signal must be re-implemented (e.g. a route redirect/refresh or
  an explicit callback), or ghost cleanup breaks.
- **Effort:** ~half to one day. Gate: `flutter analyze` + manual nav test on both mobile and desktop
  widths (mobile push + back, desktop pane-swap, ghost cleanup on immediate back).

### C. `dio` replacing `http` — *medium risk, coordinate with backend contract*
- **Why:** `dio` offers interceptors, per-request cancellation, and richer error typing.
- **Scope:** `lib/services/api_service.dart` only (now cleanly isolated behind `ChatRepository`, so
  nothing else needs to change — a direct benefit of #25). Replace the pooled `http.Client` with a
  `Dio` instance; map `DioException` types onto the existing `_TransientError` / `ApiException`
  split (timeout/connection/5xx → transient+retry; 401/403/500/format → terminal). Keep the manual
  retry/backoff **or** move it to a `dio` retry interceptor — decide, don't do both.
- **Watch out for (invariant #6):** must **not** change `_chatflowId`, `_baseUrl`, or the request
  shape/`sessionId` field. The app sends **no** `Authorization` header (the nginx reverse proxy
  injects the Flowise token server-side) — do not add auth interceptors that attach a token client-side.
  Preserve the connectivity preflight and the exact Persian error strings (now in `AppStrings.api*`).
- **Effort:** ~one day incl. re-testing the retry/offline paths. Gate: `flutter analyze` + `test` +
  a real request against `srv.hmrbot.com` and a forced-offline run.

### D. `Riverpod` replacing `provider` — *highest risk, needs explicit owner go-ahead*
- **Why:** compile-safe DI, no `ProviderNotFoundException`, easier testing; same author as `provider`.
- **Scope:** large — every provider and every `context.read/watch/Consumer` call site
  (`main.dart` MultiProvider, `AuthProvider`, `ChatProvider`, `ConversationsProvider`, and all of
  `chat_screen`/`conversations_screen`/`home_shell`). This is a rewrite of the state layer, not a
  patch.
- **Watch out for:** `ChatProvider` is created **per-conversation** with a `conversationId` +
  `onUpdate` callback and a `ValueKey`-driven recreate on the desktop — model this with a
  `.family` + `.autoDispose` `ChangeNotifierProvider`/`NotifierProvider`, and make sure the
  disposed-guard behaviour from #24 is preserved (Riverpod's autoDispose changes lifecycle timing).
  The app-scoped `ChatRepository` becomes a plain `Provider`. Do this **last** — after B/C — so the
  surface is already smaller, and keep the `chat_provider_test.dart` behaviour green as the migration's
  safety net.
- **Effort:** 1–2 days + thorough re-test of the whole app. **Gate + owner sign-off before starting.**

> Per the supervisor charter, the live action list is the Google-Drive To-Do (`HMR-Private → To Do`),
> not a git tracker. A one-line pointer to this section has been (or should be) added there; this
> report is the detailed spec these future sessions should open first.

---

## Verification summary

- `flutter analyze` — "No issues found!" on each PR (whole project).
- `flutter test` — 5/5 passing after #25/#26 (4 new `ChatProvider` tests + the existing smoke test).
- Release APK built from `main` (`b065e3e`) this session — see the session hand-off for the artifact
  path.
- No production/VPS/endpoint change; Android app behaviour and copy are unchanged for end users.
