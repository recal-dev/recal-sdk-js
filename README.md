# Recal SDK for JavaScript/TypeScript

A powerful, type-safe SDK for interacting with the Recal calendar API. Build sophisticated calendar integrations with support for Google and Microsoft calendar providers.

[![npm version](https://img.shields.io/npm/v/recal-sdk.svg)](https://www.npmjs.com/package/recal-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Multi-Provider Support**: Seamlessly work with Google Calendar and Microsoft Outlook
- **Type Safety**: Full TypeScript support with runtime validation
- **Rich Calendar Operations**: Events, busy queries, scheduling, and more
- **Organization Management**: Handle organizations and users calendars
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

- **`calendar`** - Event management and busy queries
- **`scheduling`** - Availability and booking management
- **`users`** - User profile and settings
- **`organizations`** - Team and organization management
- **`oauth`** - Calendar provider authentication

## Documentation

Full documentation for the SDK, including usage, API schemas, and integration guides, is available at [docs.recal.dev](https://docs.recal.dev). Refer to the official docs for up-to-date examples and advanced configuration options.



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
├── entities/
│   ├── organization.ts             # Domain models
│   └── user.ts
├── services/             # Service implementations
│   ├── calendar.service.ts
│   ├── oauth.service.ts
│   ├── organizations.service.ts
│   ├── scheduling.service.ts
│   └── users.service.ts
├── typebox/              # Runtime validation schemas (auto-generated)
│   ├── calendar.tb.ts
│   ├── oauth.tb.ts
│   ├── organization.stripped.tb.ts
│   ├── organization.tb.ts
│   ├── scheduling.tb.ts
│   ├── timeString.tb.ts
│   ├── user.stripped.tb.ts
│   └── user.tb.ts
├── types/                # TypeScript type definitions
│   ├── calendar.types.ts
│   ├── internal.types.ts
│   ├── oauth.types.ts
│   ├── organization.types.ts
│   ├── scheduling.types.ts
│   └── user.types.ts
├── utils/                # Helper utilities
│   ├── fetch.helper.ts
│   ├── fetchErrorHandler.ts
│   ├── functionize.ts
│   ├── includes.helper.ts
│   └── omit.ts
├── errors.ts             # Custom error classes
└── index.ts              # Main client and exports
```

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

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/integrations/users.test.ts

# Run with coverage
bun test --coverage
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`bun test && bun run check:fix`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/recal-dev/recal-sdk-js/issues) with:

- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- SDK version and environment details

## Support

- **Documentation**: [https://docs.recal.dev](https://docs.recal.dev)
- **API Reference**: [https://api.recal.dev/docs](https://api.recal.dev/v1/swagger)
- **Email**: team@recal.dev
- **Slack**: [Join our community](https://join.slack.com/t/recal-workspace/shared_invite/zt-394r5j23n-WDr_tz753Cf8lQljrK_0Mw)

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each version.

---

Built with ❤️ by the [Recal](https://recal.dev) team