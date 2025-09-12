# Changelog

All notable changes to this project will be documented in this file.

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
