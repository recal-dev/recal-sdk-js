# Recal SDK for JavaScript/TypeScript

A powerful, type-safe SDK for interacting with the Recal calendar API. Build sophisticated calendar integrations with support for Google and Microsoft calendar providers.

[![npm version](https://img.shields.io/npm/v/recal-sdk.svg)](https://www.npmjs.com/package/recal-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Multi-Provider Support**: Seamlessly work with Google Calendar and Microsoft Outlook
- **Type Safety**: Full TypeScript support with runtime validation
- **Rich Calendar Operations**: Events, free/busy queries, scheduling, and more
- **Organization Management**: Handle teams and multi-user calendar scenarios
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

// Initialize the client
const recal = new RecalClient({
    token: 'recal_your_api_token', // or use RECAL_TOKEN env variable
    url: 'https://api.recal.dev'   // optional, defaults to production
})
```

### Authentication

The SDK requires a Recal API token. You can provide it in three ways:

1. **Direct in constructor** (recommended for server-side apps):
```typescript
const recal = new RecalClient({ token: 'recal_your_token' })
```

2. **Environment variable**:
```bash
export RECAL_TOKEN="recal_your_token"
```

3. **Function (for dynamic tokens)**:
```typescript
const recal = new RecalClient({ 
    token: () => getTokenFromSecureStore() 
})
```

> **Security Note**: This SDK is designed for server-side use. Never expose your API token in client-side code.

## Core Concepts

### Services

The SDK is organized into logical service modules:

- **`calendar`** - Event management and free/busy queries
- **`scheduling`** - Availability and booking management
- **`users`** - User profile and settings
- **`organizations`** - Team and organization management
- **`oauth`** - Calendar provider authentication

### Providers

Recal supports two calendar providers:
- `google` - Google Calendar
- `microsoft` - Microsoft Outlook/Office 365

### Time Zones

All date/time operations support timezone specification via the `timeZone` parameter or `x-timezone` header.

## API Reference

### Calendar Service

#### Get Free/Busy Information

```typescript
// Get user's availability
const freeBusy = await recal.calendar.getFreeBusy(
    'user_id',
    new Date('2024-01-01'),
    new Date('2024-01-07'),
    'google',  // optional: filter by provider
    'America/New_York'  // optional: timezone
)
```

#### List Events

```typescript
// Get all events in a date range
const events = await recal.calendar.getEvents(
    'user_id',
    new Date('2024-01-01'),
    new Date('2024-01-31'),
    ['google', 'microsoft'],  // optional: multiple providers
    'Europe/London'
)
```

#### Create Event

```typescript
// Create a new event
const event = await recal.calendar.createEvent(
    'user_id',
    'google',
    'calendar_id',
    {
        summary: 'Team Meeting',
        description: 'Weekly sync',
        start: { dateTime: '2024-01-15T10:00:00Z' },
        end: { dateTime: '2024-01-15T11:00:00Z' },
        attendees: [
            { email: 'colleague@company.com' }
        ]
    },
    'America/Los_Angeles'
)
```

#### Update Event

```typescript
// Update an existing event
const updated = await recal.calendar.updateEvent(
    'user_id',
    'google',
    'calendar_id',
    'event_id',
    {
        summary: 'Updated Meeting Title',
        start: { dateTime: '2024-01-15T14:00:00Z' },
        end: { dateTime: '2024-01-15T15:00:00Z' }
    }
)
```

#### Delete Event

```typescript
// Delete an event
await recal.calendar.deleteEvent(
    'user_id',
    'google',
    'calendar_id',
    'event_id'
)
```

#### Cross-Calendar Operations (Meta Events)

Meta events allow you to work with events across multiple calendar providers:

```typescript
// Create event across all connected calendars
const metaEvent = await recal.calendar.createEventByMetaId(
    'user_id',
    {
        summary: 'Cross-platform meeting',
        start: { dateTime: '2024-01-20T15:00:00Z' },
        end: { dateTime: '2024-01-20T16:00:00Z' }
    },
    ['google', 'microsoft']  // Create on both providers
)

// Update across all calendars using meta ID
await recal.calendar.updateEventByMetaId(
    'user_id',
    metaEvent.metaId,
    { summary: 'Updated title' }
)

// Delete from all calendars
await recal.calendar.deleteEventByMetaId(
    'user_id',
    metaEvent.metaId
)
```

### Scheduling Service

#### Get Availability

```typescript
// Find available time slots
const availability = await recal.scheduling.getAvailability(
    'user_id',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    {
        duration: 30,  // 30-minute slots
        interval: 15,  // 15-minute intervals
        startTime: '09:00',
        endTime: '17:00'
    }
)
```

#### Book Time Slot

```typescript
// Book an available slot
const booking = await recal.scheduling.bookSlot(
    'user_id',
    {
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T10:30:00Z',
        title: 'Consultation',
        attendees: ['client@example.com']
    }
)
```

### Users Service

#### Get User Profile

```typescript
// Get user information
const user = await recal.users.getUser('user_id')
console.log(user.email, user.name)
```

#### List User's Calendars

```typescript
// Get all connected calendars
const calendars = await recal.users.getCalendars('user_id', {
    includeOrganization: true
})
```

#### Update User Settings

```typescript
// Update user preferences
await recal.users.updateSettings('user_id', {
    defaultCalendarId: 'calendar_123',
    timezone: 'America/New_York',
    workingHours: {
        start: '09:00',
        end: '17:00'
    }
})
```

### Organizations Service

#### Get Organization

```typescript
// Get organization by slug
const org = await recal.organizations.getOrganization('acme-corp', {
    includeUsers: true,
    includeSettings: true
})
```

#### List Organization Members

```typescript
// Get all members
const members = await recal.organizations.getMembers('org_id')
```

#### Organization-Wide Free/Busy

```typescript
// Get team availability
const teamBusy = await recal.calendar.getOrgWideFreeBusy(
    'acme-corp',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    true,  // primaryOnly: only check primary calendars
    'google'
)
```

### OAuth Service

#### Generate OAuth URL

```typescript
// Create OAuth authorization URL
const authUrl = await recal.oauth.generateAuthUrl({
    provider: 'google',
    userId: 'user_id',
    redirectUri: 'https://app.example.com/callback',
    scopes: ['calendar.events', 'calendar.readonly']
})
```

#### Exchange OAuth Code

```typescript
// Exchange authorization code for tokens
const tokens = await recal.oauth.exchangeCode({
    provider: 'google',
    code: 'auth_code_from_callback',
    redirectUri: 'https://app.example.com/callback'
})
```

#### Refresh OAuth Token

```typescript
// Refresh expired token
const newTokens = await recal.oauth.refreshToken({
    provider: 'google',
    refreshToken: 'stored_refresh_token'
})
```

## Advanced Usage

### Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
    UserNotFoundError, 
    EventNotFoundError,
    OAuthConnectionNotFoundError,
    OrganizationNotFoundError 
} from 'recal-sdk'

try {
    const event = await recal.calendar.getEvent(
        'user_id', 
        'google', 
        'calendar_id', 
        'event_id'
    )
} catch (error) {
    if (error instanceof UserNotFoundError) {
        console.log('User does not exist:', error.userId)
    } else if (error instanceof EventNotFoundError) {
        console.log('Event not found:', error.eventId)
    } else if (error instanceof OAuthConnectionNotFoundError) {
        console.log('Calendar not connected:', error.provider)
    }
}
```

### Batch Operations

```typescript
// Process multiple users' calendars
const userIds = ['user1', 'user2', 'user3']
const allEvents = await Promise.all(
    userIds.map(userId => 
        recal.calendar.getEvents(
            userId,
            new Date('2024-01-01'),
            new Date('2024-01-31')
        )
    )
)
```

### Working with Multiple Providers

```typescript
// Aggregate availability across providers
const providers: Provider[] = ['google', 'microsoft']
const busyTimes = await Promise.all(
    providers.map(provider =>
        recal.calendar.getFreeBusy(
            'user_id',
            startDate,
            endDate,
            provider
        )
    )
)

// Merge busy periods
const merged = mergeBusyPeriods(busyTimes)
```

### Custom Request Configuration

```typescript
// Use custom headers or timeout
const recal = new RecalClient({
    token: 'recal_token',
    url: 'https://api.recal.dev',
    requestConfig: {
        timeout: 30000,  // 30 seconds
        headers: {
            'X-Custom-Header': 'value'
        }
    }
})
```

## Examples

### Building a Booking System

```typescript
// 1. Check availability
const slots = await recal.scheduling.getAvailability(
    'consultant_id',
    new Date(),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
    {
        duration: 60,
        interval: 30,
        startTime: '09:00',
        endTime: '17:00'
    }
)

// 2. Display available slots to user
const availableSlots = slots.filter(slot => !slot.busy)

// 3. Book selected slot
const booking = await recal.scheduling.bookSlot(
    'consultant_id',
    {
        start: selectedSlot.start,
        end: selectedSlot.end,
        title: 'Consultation with ' + clientName,
        description: 'Initial consultation',
        attendees: [clientEmail]
    }
)

// 4. Send confirmation
console.log('Booking confirmed:', booking.id)
```

### Syncing Calendars

```typescript
// Sync events between providers
async function syncCalendars(userId: string) {
    // Get events from Google
    const googleEvents = await recal.calendar.getEvents(
        userId,
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        'google'
    )
    
    // Copy to Microsoft calendar
    for (const event of googleEvents) {
        if (!event.metaId) { // Not already synced
            await recal.calendar.createEvent(
                userId,
                'microsoft',
                'primary',
                {
                    summary: event.summary,
                    description: event.description,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees
                }
            )
        }
    }
}
```

### Team Scheduling

```typescript
// Find time when entire team is available
async function findTeamSlot(
    orgSlug: string,
    duration: number,
    startDate: Date,
    endDate: Date
) {
    // Get organization members
    const org = await recal.organizations.getOrganization(orgSlug, {
        includeUsers: true
    })
    
    // Get everyone's busy times
    const busyTimes = await recal.calendar.getOrgWideFreeBusy(
        orgSlug,
        startDate,
        endDate,
        true // Only check primary calendars
    )
    
    // Find gaps where everyone is free
    const freeSlots = findFreeSlots(busyTimes, duration)
    
    return freeSlots
}
```

## Development

### Prerequisites

- Node.js 18+ or Bun 1.0+
- TypeScript 5.0+

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
├── index.ts              # Main client and exports
├── services/             # Service implementations
│   ├── calendar.service.ts
│   ├── scheduling.service.ts
│   ├── users.service.ts
│   ├── organizations.service.ts
│   └── oauth.service.ts
├── entities/             # Domain models
│   ├── user.ts
│   ├── organization.ts
│   └── event.ts
├── types/                # TypeScript type definitions
│   ├── calendar.types.ts
│   ├── scheduling.types.ts
│   └── internal.types.ts
├── typebox/              # Runtime validation schemas (auto-generated)
├── utils/                # Helper utilities
│   ├── fetch.helper.ts
│   ├── includes.helper.ts
│   └── functionize.ts
└── errors.ts             # Custom error classes
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
bun test tests/calendar.test.ts

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
- **API Reference**: [https://api.recal.dev/docs](https://api.recal.dev/docs)
- **Email**: team@recal.dev
- **Discord**: [Join our community](https://discord.gg/recal)

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each version.

---

Built with ❤️ by the [Recal](https://recal.dev) team