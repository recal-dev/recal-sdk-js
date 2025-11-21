# Recal SDK for JavaScript/TypeScript

A powerful, type-safe SDK for interacting with the Recal calendar API. Build sophisticated calendar integrations with support for Google and Microsoft calendar providers.

[![npm version](https://img.shields.io/npm/v/recal-sdk.svg)](https://www.npmjs.com/package/recal-sdk)
[![Tests](https://github.com/recal-dev/recal-sdk-js/actions/workflows/tests.yml/badge.svg)](https://github.com/recal-dev/recal-sdk-js/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Multi-Provider Support**: Seamlessly work with Google Calendar and Microsoft Outlook
- **Type Safety**: Full TypeScript support with Zod runtime validation
- **Auto-Generated Client**: Powered by HeyAPI OpenAPI code generation
- **Rich Calendar Operations**: Events, busy queries, scheduling, and more
- **Organization Management**: Handle organizations and user calendars
- **OAuth Integration**: Built-in OAuth flow support for calendar connections
- **Error Handling**: Comprehensive error types for robust applications
- **Modern Architecture**: Clean, testable service-based design

## Installation

```bash
# Using npm
npm install recal-sdk

# Using yarn
yarn add recal-sdk

# Using bun
bun add recal-sdk
```

## Quick Start

### Basic Setup

```typescript
import { RecalClient } from 'recal-sdk'

// Initialize the client with token from .env file (RECAL_TOKEN)
const recal = new RecalClient()

// Or manually provide the token
const recal = new RecalClient({ 
    token: "recal_xyz"
})
```

> **Security Note**: This SDK is designed for server-side use. Never expose your API token in client-side code.

## Core Concepts

### Services

The SDK is organized into logical service modules:

- **`calendar`** - Calendar management and busy queries
- **`events`** - Event creation, updates, and queries
- **`scheduling`** - Availability and booking management
- **`users`** - User profile and settings
- **`organizations`** - Team and organization management
- **`oauth`** - Calendar provider authentication

## Documentation

- **API Reference**: [docs.recal.dev](https://docs.recal.dev) - Comprehensive guides and API schemas
- **Usage Examples**: [USAGE.md](./USAGE.md) - Detailed code examples for all services
- **OpenAPI Spec**: [api.recal.dev/v1/swagger](https://api.recal.dev/v1/swagger) - Interactive API documentation

## Configuration

### Environment Variables

- **`RECAL_TOKEN`** (required) - Your Recal API token (must start with "recal_")
- **`RECAL_URL`** (optional) - API base URL (defaults to `https://api.recal.dev`)

```typescript
// Using environment variables
// Set RECAL_TOKEN in your .env file
const recal = new RecalClient()

// Or provide explicitly
const recal = new RecalClient({
    token: "recal_xyz",
    url: "https://api.recal.dev"  // optional
})
```

## SDK Development

### Prerequisites

- Node.js 18+ or Bun 1.0+, or any other JavaScript runtime
- TypeScript 5.0+
- Biome 2.1.2 (for contributing)

### Setup

```bash
# Clone the repository
git clone https://github.com/recal-dev/recal-sdk-js.git
cd recal-sdk-js

# Install dependencies
bun install

# Run tests
bun test

# Build the SDK
bun run build
```

### Project Structure

```
src/
├── client/               # Auto-generated HeyAPI SDK (DO NOT EDIT)
│   ├── client.gen.ts     # HTTP client
│   ├── sdk.gen.ts        # Generated SDK functions
│   ├── types.gen.ts      # Generated TypeScript types
│   ├── zod.gen.ts        # Zod validation schemas
│   └── core/             # Core utilities
├── services/             # Service wrapper implementations
│   ├── calendar.service.ts
│   ├── events.service.ts
│   ├── oauth.service.ts
│   ├── organizations.service.ts
│   ├── scheduling.service.ts
│   └── users.service.ts
├── utils/                # Helper utilities
│   ├── functionize.ts    # Lazy evaluation helper
│   └── response.ts       # Response unwrapper
├── errors.ts             # Custom error classes
├── index.ts              # Main exports
├── recal.ts              # Recal client class
└── types.ts              # Type re-exports
```

> **Note**: All files in `client/` with `*.gen.ts` suffix are auto-generated from the OpenAPI specification and should not be edited manually. Use `bun run generate` to regenerate them.

### Code Generation

This SDK uses [HeyAPI's OpenAPI TypeScript generator](https://heyapi.vercel.app/) to create type-safe client code from the Recal API OpenAPI specification.

```bash
# Regenerate client code from OpenAPI spec
bun run generate
```

The generation process:
1. Fetches the latest OpenAPI spec from the Recal API
2. Generates TypeScript types, Zod schemas, and SDK functions
3. Creates all `*.gen.ts` files in `src/client/`

**When to regenerate:**
- After API updates or new endpoint additions
- When types or schemas need to be refreshed
- Before major version releases

### Code Style

This project uses Biome for formatting and linting:

```bash
# Format code
bun run format:fix

# Lint code
bun run lint:fix

# Run all checks
bun run check:fix
```

### Testing

The SDK includes comprehensive integration tests for all services.

**Required Environment Variables:**
```bash
RECAL_TOKEN=recal_xxx          # Required for all tests
RECAL_URL=https://api.recal.dev # Optional, defaults to production

# Optional (for OAuth integration tests)
GOOGLE_ACCESS_TOKEN=xxx
GOOGLE_REFRESH_TOKEN=xxx
```

**Run Tests:**
```bash
# Run all tests
bun test

# Run specific test file
bun test tests/integrations/users.test.ts

# Run with coverage
bun test --coverage
```

> **Note**: Tests without OAuth tokens will skip OAuth-dependent tests automatically.

## Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`bun test && bun run check:fix`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Guidelines

- Follow the existing code style (enforced by Biome)
- Add tests for new features
- Update documentation as needed
- Keep commits focused and descriptive
- Do not edit `*.gen.ts` files (auto-generated)

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/recal-dev/recal-sdk-js/issues) with:

- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- SDK version and environment details

## Support

- **Documentation**: [https://docs.recal.dev](https://docs.recal.dev)
- **API Reference**: [https://api.recal.dev/v1/swagger](https://api.recal.dev/v1/swagger)
- **Email**: team@recal.dev
- **Slack**: [Join our community](https://join.slack.com/t/recal-workspace/shared_invite/zt-394r5j23n-WDr_tz753Cf8lQljrK_0Mw)

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each version.

---

Built with ❤️ by the [Recal](https://recal.dev) team