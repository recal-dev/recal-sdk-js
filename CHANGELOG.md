# Changelog

All notable changes to this project will be documented in this file.

## ⚠️ v1.2.0 — Partial organization answers are now visible (2026-09-24)

### ✨ Added
- **`organizations.getBusyTimes()` and `organizations.getScheduling()` report `failedUsers`.**
  The API answers 200 with the users whose calendars it could not read, rather than failing
  the whole request. Each entry carries the user's `customId` and a reason. A non-empty
  `failedUsers` means the busy times or slots beside it are a *partial* answer.
- `FailedFreeBusyUser` is exported from the package root.
- `403` and `429` are documented on the user free/busy and scheduling endpoints, and the
  user free/busy route documents a `400` for requesting more calendars than the limit allows.

### ⚠️ Upgrading
Three breaking changes.

**1. The two organization methods return an envelope.** They resolved to the payload;
they now resolve to `{ data, failedUsers }`.

```typescript
// before
const busy = await recal.organizations.getBusyTimes('acme', { start, end })
busy.forEach(…)

// after
const { data: busy, failedUsers } = await recal.organizations.getBusyTimes('acme', { start, end })
if (failedUsers.length > 0) { /* the busy times below are partial */ }
busy.forEach(…)
```

No other method changed shape.

**2. Generated type exports were renamed.** A path parameter now contributes `By<Param>`,
so `GetV1UsersUserIdSchedulingData` is now `GetV1UsersByUserIdSchedulingData`, and likewise
for all 33 parameterised operations. This affects only the generated `GetV1…` / `PostV1…` /
`PutV1…` / `DeleteV1…` names; the domain types (`Calendar`, `Event`, `User`, `TimeRange`,
`Provider`, …) are untouched. For `recal.*` service methods, no method name, argument, or
URL changed — only these type names. The operation ids these names derive from are now
pinned in the API, so they will not move again.

Callers going through `RecalSDK.*` — the raw generated functions, re-exported from the
package root for direct use without the `Recal` wrapper — see more than the rename: the
same 33 functions are renamed on the function name itself, and 12 of them (beyond the two
scheduling functions covered in (3) below) had an optional `body` argument become required.
`recal.*` service methods are unaffected by that second part; each already supplied its
body unconditionally.

**3. `scheduling.getAdvancedSlots()` and `scheduling.getMultiUserSlots()` now require their
`body` argument.** Both took `body?`, but the API validates a required field on each of
those request bodies — `schedules` for the single-user advanced route, `users` for the
multi-user route — so a call omitting it has always been answered with a 400. The
regenerated types just say what the API always did. Unlike the two changes above, this one
changes the meaning of a call that compiles today: anyone omitting the body was already
getting a runtime error, and will now get a compile error instead.

## 🐛 v1.1.0 — Multi-user scheduling no longer throws (2026-09-21)

### 🩹 Fixed
- **`scheduling.getMultiUserSlots()` crashed the whole batch when any user was unresolved.**
  The API answers 200 with a per-user result, but the generated response transformer
  dereferenced `availableSlots` unconditionally. One user without a connected calendar
  raised a `TypeError` that discarded *every* other user's slots and destroyed the API's
  own error message with them. Slots now survive, and each failed user reports its reason.
- `bun run generate` produced a client that did not compile, so the SDK could not be
  regenerated at all. Two causes: a transformer HeyAPI references but never defines, and
  numeric defaults emitted onto string-typed query params.

### ✨ Added
- Per-user entries carry `status: 'ok' | 'error'`, so results can be narrowed safely
  instead of by guessing which keys are present.
- `calendarIds` accepts a single string as well as an array.
- `read` and `write` join `free-busy` as OAuth scope values. `edit` is now deprecated —
  still accepted as a synonym for `write`, and no longer the default.
- OAuth connections expose `type`.
- `401` and `502` are documented on the calendar endpoints.
- `RECAL_OPENAPI_URL` overrides the schema source when generating the client.

### ⚠️ Upgrading
No breaking changes — every addition is additive and existing calls keep working.
`getMultiUserSlots()` callers should narrow on `status` before reading `availableSlots`;
an entry never reports an empty `availableSlots` to signal failure, so `[]` now
unambiguously means "no availability".

## 🚀 v0.2.3 — Initial public release (2025-09-12)

### 🧭 Overview
A type-safe SDK for interacting with the Recal calendar platform, focused on building robust calendar integrations across leading providers.

### ✨ Highlights
- 📅 Multi-provider calendar connectivity (Google and Microsoft).
- ✅ End-to-end type safety with runtime validation.
- 🧩 Comprehensive service surface for calendar operations, scheduling, user and organization management, and authentication.
- ⚠️ Clear error semantics with domain-specific error types for reliable handling.
- 🏗️ Modern, testable architecture with CI workflows for quality and publishing.

### 🆕 Added
- 📅 Calendar capabilities covering availability queries, event listing and management, and cross-calendar operations using meta identifiers.
- ⏱️ Scheduling features for individual users and organizations, including configurable slot duration, padding, working hours, time zone support, and advanced schedule rules.
- 👤 User management including creation, retrieval with optional related data, updates, deletion, and listing.
- 🏢 Organization management including creation, retrieval, updates, deletion, listing, and member management.
- 🔑 OAuth authentication flows including link generation, bulk link retrieval, connection management, and verification.

### 🛠️ Tooling & Quality
- 🧰 TypeScript-first development with runtime validation.
- 🧹 Project formatting and linting configured via Biome.
- ✅ Tests executed with Bun and automated in continuous integration.
- 🚢 Release automation and version checks configured in CI.

### 🧩 Compatibility
- 🟢 Node.js 18+ or Bun 1.0+ environments.
- 📘 TypeScript 5.x.
- 📦 ESM package with bundled type definitions.

### 🔐 Security Notes
- 🔒 Designed for server-side environments. Keep API tokens in secure backend contexts and never expose them in client-side code.

---

## 🚀 v0.2.4 — (2025-09-12)

### 🆕 Added
- CHANGELOG.md

---

## 🚀 v0.2.5 — (2025-09-12)

### 🆕 Added
- oicd npm publish workflow
- npm github link

---

## 🚀 v0.2.8 — (2025-09-13)

### 🆕 Added
- Clean up scheduling
- Add maxOverlaps to scheduling

---

## 🚀 v0.3.0 — (2025-09-28)

### 🆕 Added
- Better error handling
- Conistent start and end date parameter names

## v0.3.1 - (2025-10-07)

### 🆕 Added
- Calendar Id filtering for busy and events functions

## v0.3.2 - (2025-10-08)

### 🆕 Added
- listCalendars method to calendar service

## v0.3.2 - (2025-10-10)

### 🆕 Added
- getFreshAccessToken to oauth service

---

## 🎉 v1.0.0 — Stable Release (2025-11-19)

### 🧭 Overview
First stable release with production-ready architecture, comprehensive testing, and improved CI/CD workflows.

### ✨ Major Changes
- 🔄 **Architecture Refactor**: Migrated to HeyAPI-powered code generation from OpenAPI specification
- 🔐 **Validation**: Switched from TypeBox to Zod for runtime schema validation
- 🏗️ **Type Generation**: All types, schemas, and SDK functions auto-generated from OpenAPI spec
- 🧪 **Testing**: Enhanced test suite with OAuth integration support and concurrency control
- 🚀 **CI/CD**: Improved GitHub Actions workflows for testing and publishing

### 🆕 Added
- Auto-generated client code using `@hey-api/openapi-ts`
- Comprehensive integration tests for all services
- Reusable test workflow with concurrency management
- Environment variable configuration for testing (RECAL_TOKEN, RECAL_URL, OAuth tokens)
- Detailed USAGE.md with code examples for all services

### 🔄 Changed
- SDK now exports `Recal` class (with `RecalClient` as backward-compatible alias)
- Service wrappers around auto-generated SDK functions
- Build process uses TypeScript compiler with tsc-alias
- Package is now ESM-only with Node.js 18+ requirement

### 🛠️ Infrastructure
- Updated GitHub Actions workflows with proper test ordering
- Added workflow concurrency control for tests
- Improved npm publish workflow with pre-publish validation
- Added test status badge to README

### 📚 Documentation
- Updated README with accurate architecture description
- Added code generation documentation
- Improved testing documentation with environment variable requirements
- Fixed API reference URLs and added USAGE.md reference

### ⚠️ Breaking Changes
- Minimum Node.js version is now 18+
- ESM-only package (no CommonJS support)
- Internal architecture completely refactored (external API remains compatible)

## 🎉 v1.0.1 — (2025-11-22)

### 🆕 Added
- Update id validators and provider types
- Update README