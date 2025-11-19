# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the Recal JavaScript/TypeScript SDK, a client library for interacting with the Recal calendar API. The SDK uses **HeyAPI's OpenAPI code generation** to create type-safe client code with **Zod runtime validation**. It provides service wrappers around auto-generated SDK functions for a clean, testable architecture.

## Architecture Overview

The SDK follows a modern code-generation architecture for type safety and maintainability:

### Core Components

1. **Generated Client** (`src/client/*.gen.ts`): Auto-generated from OpenAPI spec
   - `client.gen.ts`: HTTP client configuration
   - `sdk.gen.ts`: All API endpoint functions
   - `types.gen.ts`: TypeScript type definitions
   - `zod.gen.ts`: Zod validation schemas
   - **DO NOT EDIT** - regenerate with `bun run generate`

2. **Service Wrappers** (`src/services/`): Thin wrappers around generated SDK
   - Provide clean, domain-focused APIs
   - Use `unwrapResponse()` to extract data from HeyAPI responses
   - Handle service-specific error cases
   - Constructor-based dependency injection with HeyAPI client

3. **Type System**: Auto-generated from OpenAPI
   - **Generated Types** (`src/client/types.gen.ts`): All API types
   - **Zod Schemas** (`src/client/zod.gen.ts`): Runtime validation
   - Types exported through `src/types.ts` for external use

4. **Main Client** (`src/recal.ts`): Entry point exposing all services
   - Creates HeyAPI client with configuration
   - Initializes all service instances
   - Exports as `Recal` (with `RecalClient` alias for compatibility)

### Service Pattern

Services wrap auto-generated SDK functions:

```typescript
export class ServiceName {
    constructor(private client: Client) {}

    async methodName(id: string, options?: OptionsType): Promise<ReturnType> {
        const response = await sdk.apiEndpoint({
            client: this.client,
            path: { id },
            query: options
        })

        return unwrapResponse(response)  // Extract data or throw RecalError
    }
}
```

### Key Patterns to Follow

1. **Code Generation**: Use `bun run generate` to regenerate client from OpenAPI
2. **Never Edit Gen Files**: All `*.gen.ts` files are auto-generated
3. **Response Unwrapping**: Use `unwrapResponse()` to handle HeyAPI responses
4. **Error Handling**: `unwrapResponse()` throws `RecalError` for API errors
5. **Service Wrappers**: Keep services thin - they're just adapters over generated SDK

For detailed implementation guidance, see [STARTER.md](./devDocs/STARTER.md) (note: may be outdated).

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

# Regenerate client from OpenAPI spec
bun run generate

# Build (compiles TypeScript with tsc-alias)
bun run build
```

### Testing
- Test files are located in `tests/integrations/` directory
- Run a single test: `bun test tests/integrations/users.test.ts`
- The test suite uses Bun's built-in test runner
- Tests require environment variables: `RECAL_TOKEN`, `RECAL_URL`
- OAuth tests also need: `GOOGLE_ACCESS_TOKEN`, `GOOGLE_REFRESH_TOKEN`

## Architecture

### Project Structure
```
src/
├── client/           # Auto-generated HeyAPI SDK (DO NOT EDIT)
│   ├── client.gen.ts
│   ├── sdk.gen.ts
│   ├── types.gen.ts
│   ├── zod.gen.ts
│   └── core/
├── services/         # Service wrapper classes
│   ├── calendar.service.ts
│   ├── events.service.ts
│   ├── oauth.service.ts
│   ├── organizations.service.ts
│   ├── scheduling.service.ts
│   └── users.service.ts
├── utils/            # Utility functions
│   ├── functionize.ts
│   └── response.ts
├── errors.ts         # RecalError class
├── index.ts          # Main exports
├── recal.ts          # Recal client class
└── types.ts          # Type re-exports
```

### Key Patterns

1. **Client Architecture**: The SDK exports `Recal` class (aliased as `RecalClient`) as the main entry point with token-based authentication.

2. **Type System**:
   - All types auto-generated from OpenAPI spec in `src/client/types.gen.ts`
   - Zod schemas for runtime validation in `src/client/zod.gen.ts`
   - This enables both compile-time and runtime type validation

3. **Configuration**:
   - Environment variables: `RECAL_TOKEN` (must start with "recal_")
   - Base URL: defaults to `https://api.recal.dev` (no `/v1` suffix)
   - Options can be passed as values or functions (lazy evaluation via `functionize` utility)

4. **API Communication**:
   - Built on HeyAPI's generated client using native `fetch` API
   - Automatic Bearer token authentication
   - HeyAPI returns `{ data?, error? }` response format
   - Services use `unwrapResponse()` to extract data or throw `RecalError`

### Code Style
- Formatter: Biome with 4 spaces, 120 char lines
- JavaScript: Single quotes, minimal semicolons, ES5 trailing commas
- Always run `bun run check:fix` before committing

## Important Notes

1. **Generated Files**: Never edit `*.gen.ts` files directly - they are auto-generated from OpenAPI spec using HeyAPI
2. **Code Generation**: Use `bun run generate` to regenerate client after API changes
3. **Build Output**: The `dist/` directory contains built files in ESM format only
4. **Token Security**: This SDK is designed for server-side use only due to token requirements
5. **Current State**: v1.0.0 stable release with full API coverage across all services

## Domain Models

The SDK defines the following key types:
- `Provider`: Google or Microsoft
- `Calendar`: Calendar with timezone, colors, access role
- `Event`: Full event details with attendees and meetings
- `Attendee`: Email with response status
- `Busy`: Availability information
- `CalendarAccessRoles`: Permission levels (freeBusyReader, reader, writer, owner)