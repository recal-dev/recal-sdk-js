# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Recal JavaScript/TypeScript SDK, a client library for interacting with the Recal calendar API. The SDK is in early development with basic authentication and type definitions implemented, but most API methods are not yet built.

## Development Commands

### Package Manager
This project uses **Bun** as the package manager. All commands should be run with `bun`.

### Essential Commands
```bash
# Install dependencies
bun install

# Run tests
bun test

# Code formatting and linting (run before committing)
bun run check:fix

# Individual commands
bun run format:fix    # Fix formatting issues
bun run lint:fix      # Fix linting issues
bun run lint:fix:all  # Fix all linting issues including unsafe fixes

# Build (currently just runs the main file)
bun run build
```

### Testing
- Test files are located in `tests/` directory
- Run a single test: `bun test tests/specific-test.test.ts`
- The test suite uses Bun's built-in test runner

## Architecture

### Project Structure
```
src/
├── index.ts           # Main entry: RecalClient class
├── oauthService.ts    # OAuth service (not yet implemented)
├── typebox/          # Auto-generated TypeBox schemas (DO NOT EDIT)
├── types/            # TypeScript type definitions (edit these)
└── utils/            # Utility functions
```

### Key Patterns

1. **Client Architecture**: The SDK uses `RecalClient` as the main entry point with token-based authentication.

2. **Type System**: 
   - TypeScript interfaces in `src/types/` define the domain models
   - TypeBox schemas in `src/typebox/` are auto-generated from TypeScript types
   - This enables both compile-time and runtime type validation

3. **Configuration**:
   - Environment variables: `RECAL_TOKEN` (must start with "recal_")
   - Base URL: defaults to `https://api.recal.dev/v1`
   - Options can be passed as values or functions (lazy evaluation via `functionize` utility)

4. **API Communication**:
   - Built on native `fetch` API
   - Automatic Bearer token authentication
   - Returns `{ data?, error? }` response format

### Code Style
- Formatter: Biome with 4 spaces, 120 char lines
- JavaScript: Single quotes, minimal semicolons, ES5 trailing commas
- Always run `bun run check:fix` before committing

## Important Notes

1. **TypeBox Files**: Never edit `.tb.ts` files directly - they are auto-generated from TypeScript types
2. **Build Output**: The `dist/` directory contains built files with both CommonJS and ESM formats
3. **Token Security**: This SDK is designed for server-side use only due to token requirements
4. **Current State**: Basic authentication is implemented, but API endpoint methods need to be added

## Domain Models

The SDK defines the following key types:
- `Provider`: Google or Microsoft
- `Calendar`: Calendar with timezone, colors, access role
- `Event`: Full event details with attendees and meetings
- `Attendee`: Email with response status
- `FreeBusy`: Availability information
- `CalendarAccessRoles`: Permission levels (freeBusyReader, reader, writer, owner)