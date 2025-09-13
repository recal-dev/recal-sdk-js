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

### Time Zones

All date/time operations support timezone specification via the `timeZone` parameter.

## API Reference

> TypeScript note
>
> - Use the exported `Provider` enum for provider arguments.
> - Date/time fields in responses are parsed into `Date` objects at runtime.
>
> ```typescript
> import { Provider } from 'recal-sdk'
> ```

### Calendar Service

#### Get Busy Information

```typescript
// Get user's availability (simplest form)
const busy = await recal.calendar.getBusy(
    'user_id',
    new Date('2024-01-01'),
    new Date('2024-01-07')
)

// Or with optional filters
const busyFiltered = await recal.calendar.getBusy(
    'user_id',
    new Date('2024-01-01'),
    new Date('2024-01-07'),
    {
        provider: 'google',  // optional: filter by provider
        timeZone: 'America/New_York',  // optional: timezone
    }
)
```

#### List Events

```typescript
// Get all events in a date range (simplest form)
const events = await recal.calendar.getEvents(
    'user_id',
    new Date('2024-01-01'),
    new Date('2024-01-31')
)

// Or with optional filters
const eventsFiltered = await recal.calendar.getEvents(
    'user_id',
    new Date('2024-01-01'),
    new Date('2024-01-31'),
    {
        provider: 'google',  // optional: filter by provider
        timeZone: 'Europe/London'  // optional: timezone
    }
)
```

#### Create Event

```typescript
// Create a new event (without optional timezone)
const event = await recal.calendar.createEvent({
    userId: 'user_id',
    provider: 'google',
    calendarId: 'calendar_id',
    event: {
        subject: 'Team Meeting',
        description: 'Weekly sync',
        start: new Date('2024-01-15T10:00:00Z'),
        end: new Date('2024-01-15T11:00:00Z'),
        attendees: [
            { email: 'colleague@company.com' }
        ]
    }
})

// Or with timezone option
const eventWithTZ = await recal.calendar.createEvent({
    userId: 'user_id',
    provider: 'google',
    calendarId: 'calendar_id',
    event: {
        subject: 'Team Meeting',
        description: 'Weekly sync',
        start: new Date('2024-01-15T10:00:00Z'),
        end: new Date('2024-01-15T11:00:00Z'),
        attendees: [
            { email: 'colleague@company.com' }
        ]
    },
    options: { timeZone: 'Europe/Berlin' }  // optional
})
```
#### Get Event

```typescript
// Get an existing event
const event = await recal.calendar.getEvent({
    userId: 'user_id',
    provider: 'google',
    calendarId: 'calendar_id',
    eventId: 'event_id',
    options: { timeZone: 'Europe/Berlin' }  // optional
})
```

#### Update Event

```typescript
// Update an existing event (simplest form)
const updated = await recal.calendar.updateEvent({
    userId: 'user_id',
    provider: 'google',
    calendarId: 'calendar_id',
    eventId: 'event_id',
    event: {
        subject: 'Updated Meeting Title',
        start: new Date('2024-01-15T14:00:00Z'),
        end: new Date('2024-01-15T15:00:00Z')
    }
})
```

```typescript
// or with more options
const updated = await recal.calendar.updateEvent({
    userId: 'user_id',
    provider: 'google',
    calendarId: 'calendar_id',
    eventId: 'event_id',
    event: {
        subject: 'Updated Meeting title',
        description: 'Updated description',
        start: new Date('2024-01-15T11:00:00Z'),
        end: new Date('2024-01-15T12:00:00Z'),
        attendees: [
            { email: 'colleague@company.com' }
        ]
    },
    options: { timeZone: 'Europe/Berlin' }  // optional
})
```

#### Delete Event

```typescript
// Delete an event
await recal.calendar.deleteEvent({
    userId: 'user_id',
    provider: 'google',
    calendarId: 'calendar_id',
    eventId: 'event_id'
})
```

#### Cross-Calendar Operations (Meta Events)

Meta events allow you to work with events across multiple calendar providers:

```typescript
// Create event across all connected calendars (default behavior)
const metaEvent = await recal.calendar.createEventByMetaId(
    'user_id',
    {
        subject: 'Cross-platform meeting',
        start: new Date('2024-01-20T15:00:00Z'),
        end: new Date('2024-01-20T16:00:00Z')
    }
)

// Or specify which providers and timezone to use
const metaEventSpecific = await recal.calendar.createEventByMetaId(
    'user_id',
    {
        subject: 'Cross-platform meeting',
        start: new Date('2024-01-20T15:00:00Z'),
        end: new Date('2024-01-20T16:00:00Z')
    },
    { 
        provider: ['google', 'microsoft'], // Create on specific providers
        timeZone: 'Europe/Berlin' // optional
    }  
)

// Get event across all connected calendars (default behavior)
const metaEventGet = await recal.calendar.getEventByMetaId(
    'user_id',
    metaEvent.metaId
)

// Update across all calendars using meta ID
await recal.calendar.updateEventByMetaId(
    'user_id',
    metaEvent.metaId,
    { subject: 'Updated title' }
)

// Delete from all calendars
await recal.calendar.deleteEventByMetaId(
    'user_id',
    metaEvent.metaId
)
```

### Scheduling Service

#### Get User Availability (Basic)

```typescript
// Find available time slots (minimal config)
const availability = await recal.scheduling.user(
    'user_id',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    {
        slotDuration: 30  // Only required: slot duration in minutes
    }
)

// Or with more options
const availabilityDetailed = await recal.scheduling.user(
    'user_id',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    {
        slotDuration: 30,  // Duration of each slot in minutes
        padding: 0,  // Padding between slots
        earliestTimeEachDay: '09:00',  // Format: HH:mm
        latestTimeEachDay: '17:00',  // Format: HH:mm
        provider: 'google',  // optional: filter by provider
        timeZone: 'America/New_York'  // optional
    }
)
```

#### Allow Overlapping Events

```typescript
// Find availability even when user already has events scheduled
const availabilityWithOverlaps = await recal.scheduling.user(
    'user_id',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    {
        slotDuration: 30,
        maxOverlaps: 2,  // Allow up to 2 overlapping events per slot
        timeZone: 'America/New_York'
    }
)

// maxOverlaps: 2, means 1 slot is still available even if the user has 2 existing events at the same time.
// This enables booking a n concurrent events - useful for optional meetings,
// tentative invites, or users who can handle multiple events simultaneous, like a team that has just one calendar.
```

#### Get User Availability (Advanced)

```typescript
// Find available time slots with custom schedules
const schedules = [
    {
        days: ['monday'],  // Monday
        start: '09:00',
        end: '17:00'
    },
    // ... more schedule rules
]

// Minimal config
const availability = await recal.scheduling.userAdvanced(
    'user_id',
    schedules,
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    { slotDuration: 30 }  // Only required option
)

// Or with more options
const availabilityDetailed = await recal.scheduling.userAdvanced(
    'user_id',
    schedules,
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    {
        slotDuration: 30,
        padding: 15,
        provider: 'google',  // optional
        timeZone: 'America/New_York'  // optional
    }
)
```

#### Get Organization-Wide Availability

```typescript
// Find organization-wide available time slots (minimal)
const orgAvailability = await recal.scheduling.organization(
    'org-slug',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    { slotDuration: 60 }  // Only required option
)

// Or with constraints
const orgAvailabilityConstrained = await recal.scheduling.organization(
    'org-slug',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    {
        slotDuration: 60,
        padding: 0,
        earliestTimeEachDay: '09:00',
        latestTimeEachDay: '17:00',
        provider: ['google', 'microsoft'],  // optional
        timeZone: 'America/New_York'  // optional
    }
)
```

### Users Service

#### Get User

```typescript
// Get user information (basic)
const user = await recal.users.get('user_id', {})

// Or with additional data
const userWithDetails = await recal.users.get('user_id', {
    includeOrgs: true,  // Include organizations
    includeOAuth: true  // Include OAuth connections
})
console.log(user.id)
```

#### List All Users

```typescript
// Get all users
const users = await recal.users.listAll()
```

#### Create User

```typescript
// Create a new user (without organizations)
const user = await recal.users.create('user_id')

// Or with organization memberships
const userWithOrgs = await recal.users.create(
    'user_id',
    ['org-slug-1', 'org-slug-2']  // optional: organization slugs
)
```

#### Update User

```typescript
// Update user ID
const updatedUser = await recal.users.update('old_user_id', {
    id: 'new_user_id'
})
```

#### Delete User

```typescript
// Delete a user
const deletedUser = await recal.users.delete('user_id')
```

### Organizations Service

#### Get Organization

```typescript
// Get organization by slug
const org = await recal.organizations.get('acme-corp')
```

#### List All Organizations

```typescript
// Get all organizations
const orgs = await recal.organizations.listAll()

// Get organizations for a specific user
const userOrgs = await recal.organizations.listAllFromUser('user_id')
```

#### Create Organization

```typescript
// Create a new organization
const org = await recal.organizations.create(
    'acme-corp',  // slug
    'Acme Corporation'  // name
)
```

#### Update Organization

```typescript
// Update organization
const updated = await recal.organizations.update('acme-corp', {
    slug: 'new-slug',
    name: 'New Name'
})
```

#### Manage Members

```typescript
// Get all members
const members = await recal.organizations.getMembers('acme-corp')

// Add members
await recal.organizations.addMembers(
    'acme-corp',
    ['user_id_1', 'user_id_2']
)

// Remove members
await recal.organizations.removeMembers(
    'acme-corp',
    ['user_id_1', 'user_id_2']
)
```

#### Organization-Wide Busy

```typescript
// Get team availability (simplest form)
const teamBusy = await recal.calendar.getOrgWideBusy(
    'acme-corp',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    true  // primaryOnly: only check primary calendars
)

// Or with optional filters
const teamBusyFiltered = await recal.calendar.getOrgWideBusy(
    'acme-corp',
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    true,  // primaryOnly: only check primary calendars
    {
        provider: 'google',  // optional: filter by provider
        timeZone: 'America/New_York'  // optional
    }
)
```

### OAuth Service

#### Get OAuth Link

```typescript
// Get OAuth authorization URL (with defaults)
const link = await recal.oauth.getLink(
    'user_id',
    'google'
)

// Or with custom options
const linkWithOptions = await recal.oauth.getLink(
    'user_id',
    'google',
    {
        scope: 'edit',  // 'edit' or 'free-busy' (for OAuth scopes)
        accessType: 'offline',  // 'offline' or 'online'
        redirectUrl: 'https://app.example.com/callback'  // optional
    }
)
console.log(link.url)  // Use this URL to redirect user
```

#### Get Multiple OAuth Links

```typescript
// Get OAuth URLs for all providers (simplest)
const links = await recal.oauth.getBulkLinks('user_id')

// Or with specific providers and options
const linksFiltered = await recal.oauth.getBulkLinks(
    'user_id',
    {
        provider: ['google', 'microsoft'],
        scope: 'edit',
        accessType: 'offline'
    }
)
```

#### Manage OAuth Connections

```typescript
// Get all OAuth connections for a user
const connections = await recal.oauth.getAllConnections(
    'user_id',
    true  // redacted (default: true)
)

// Get specific provider connection
const googleConnection = await recal.oauth.getConnection(
    'user_id',
    'google',
    false  // redacted
)

// Set OAuth tokens manually
const connection = await recal.oauth.setConnection(
    'user_id',
    'google',
    {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',  // optional
        scope: ['calendar.events', 'calendar.readonly'],
        expiresAt: new Date('2024-12-31'),  // optional
        email: 'user@example.com'  // optional
    }
)

// Disconnect a provider
await recal.oauth.disconnect('user_id', 'google')
```

#### Verify OAuth Callback

```typescript
// Verify OAuth code from callback
const result = await recal.oauth.verify(
    'google',
    'auth_code_from_callback',
    'edit',  // 'edit' or 'free-busy' - single scope, not array
    'state_parameter',
    'https://app.example.com/callback'  // optional
)
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
    const event = await recal.calendar.getEvent({
        userId: 'user_id',
        provider: 'google',
        calendarId: 'calendar_id',
        eventId: 'event_id'
    })
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
// Process multiple users' calendars (simplest form)
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
// Get all busy data (without filtering)
const startDate = new Date('2024-01-01')
const endDate = new Date('2024-01-31')

const allBusy = await recal.calendar.getBusy(
    'user_id',
    startDate,
    endDate
)

// Or aggregate by specific providers
const providers: Provider[] = ['google', 'microsoft']
const busyTimes = await Promise.all(
    providers.map(provider => 
        recal.calendar.getBusy(
            'user_id',
            startDate,
            endDate,
            { provider }  // filter by specific provider
        )
    )
)

// Process the busy times as needed for your application
// Each element is Busy = TimeRange[]; flatten into a single array of TimeRange
const allBusyPeriods = busyTimes.flat()
```

### Custom Request Configuration

```typescript
// Use custom base URL
const recal = new RecalClient({
    token: 'recal_token',
    url: 'https://api.recal.dev'  // optional, this is the default
})
```

## Examples

### Building a Booking System

```typescript
// 1. Check availability
const availability = await recal.scheduling.user(
    'consultant_id',
    new Date(),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
    {
        slotDuration: 60,  // 60-minute slots
        padding: 15,  // 15-minute padding between slots
        earliestTimeEachDay: '09:00',
        latestTimeEachDay: '17:00',
        timeZone: 'America/New_York'
    }
)

// 2. Display available slots to user
const availableSlots = availability.availableSlots  // Already filtered for availability

// 3. User selects a slot and provides their information
const selectedSlot = availableSlots[0]  // Example: first available slot
const clientName = 'John Doe'
const clientEmail = 'john@example.com'

// 4. Create an event for the selected slot (using calendar service)
const booking = await recal.calendar.createEvent({
    userId: 'consultant_id',
    provider: 'google',
    calendarId: 'primary',
    event: {
        subject: 'Consultation with ' + clientName,
        description: 'Initial consultation',
        start: selectedSlot.start,
        end: selectedSlot.end,
        attendees: [{ email: clientEmail }]
    }
})

// 5. Send confirmation
console.log('Booking confirmed:', booking.id)
```

### Syncing Calendars

```typescript
// Sync events between providers
async function syncCalendars(userId: string) {
    // Get all events from all providers
    const allEvents = await recal.calendar.getEvents(
        userId,
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    )
    
    // Or get events from Google only
    const googleEvents = await recal.calendar.getEvents(
        userId,
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        { provider: 'google' }
    )
    
    // Copy to Microsoft calendar
    for (const event of googleEvents) {
        if (!event.metaId) { // Not already synced
            await recal.calendar.createEvent({
                userId,
                provider: 'microsoft',
                calendarId: 'primary',
                event: {
                    subject: event.subject,
                    description: event.description,
                    start: event.start,
                    end: event.end,
                    attendees: event.attendees
                }
            })
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
    // Option 1: Get raw busy times for manual processing
    const busyTimes = await recal.calendar.getOrgWideBusy(
        orgSlug,
        startDate,
        endDate,
        true  // Only check primary calendars
    )
    // Process busyTimes array to find gaps for your needs
    
    // Option 2: Use the scheduling service (recommended)
    const availability = await recal.scheduling.getOrgWideAvailability(
        orgSlug,
        startDate,
        endDate,
        {
            slotDuration: duration,
            padding: 0,
            earliestTimeEachDay: '09:00',
            latestTimeEachDay: '17:00'
        }
    )
    
    // Returns ready-to-use available time slots
    return availability.availableSlots
}
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
├── index.ts              # Main client and exports
├── services/             # Service implementations
│   ├── calendar.service.ts
│   ├── scheduling.service.ts
│   ├── users.service.ts
│   ├── organizations.service.ts
│   └── oauth.service.ts
├── entities/             # Domain models
│   ├── user.ts
│   └── organization.ts
├── types/                # TypeScript type definitions
│   ├── calendar.types.ts
│   ├── scheduling.types.ts
│   ├── internal.types.ts
│   └── oauth.types.ts
├── typebox/              # Runtime validation schemas (auto-generated)
│   ├── calendar.tb.ts
│   ├── scheduling.tb.ts
│   ├── oauth.tb.ts
│   ├── organization.tb.ts
│   ├── user.tb.ts
│   ├── timeString.tb.ts
│   ├── organization.stripped.tb.ts
│   └── user.stripped.tb.ts
├── utils/                # Helper utilities
│   ├── fetch.helper.ts
│   ├── fetchErrorHandler.ts
│   ├── includes.helper.ts
│   ├── functionize.ts
│   └── omit.ts
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
- **API Reference**: [https://api.recal.dev/docs](https://api.recal.dev/docs)
- **Email**: team@recal.dev
- **Discord**: [Join our community](https://discord.gg/recal)

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each version.

---

Built with ❤️ by the [Recal](https://recal.dev) team