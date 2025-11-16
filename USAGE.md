# Recal SDK Usage Guide

## Installation

```bash
npm install recal-sdk
# or
yarn add recal-sdk
# or
bun add recal-sdk
```

## Quick Start

```typescript
import { Recal } from 'recal-sdk'

const recal = new Recal({
  token: 'recal_...' // or process.env.RECAL_TOKEN
})
```

## Basic Examples

### Users

```typescript
import { Recal, type User } from 'recal-sdk'

const recal = new Recal({ token: 'recal_...' })

// Get all users
const { data: users } = await recal.getUsers()

// Get a specific user with relations
const { data: user } = await recal.getUsersUserId({
  path: { userId: '123' },
  query: { include: ['organizations', 'oauthConnections'] }
})

// Create a user
const { data: newUser } = await recal.postUsers({
  body: {
    id: 'user-123',
    organizationSlugs: ['org-1', 'org-2']
  }
})

// Update a user
const { data: updatedUser } = await recal.putUsersUserId({
  path: { userId: '123' },
  body: { userId: 'new-id' }
})

// Delete a user
const { data: deletedUser } = await recal.deleteUsersUserId({
  path: { userId: '123' }
})
```

### Organizations

```typescript
// List all organizations
const { data: orgs } = await recal.getOrganizations()

// Get organization
const { data: org } = await recal.getOrganizationsOrgSlug({
  path: { orgSlug: 'acme-corp' }
})

// Create organization
const { data: newOrg } = await recal.postOrganizations({
  body: {
    slug: 'acme-corp',
    name: 'Acme Corporation'
  }
})

// Update organization
const { data: updatedOrg } = await recal.putOrganizationsOrgSlug({
  path: { orgSlug: 'acme-corp' },
  body: {
    slug: 'acme-corp',
    name: 'Acme Corp (Updated)'
  }
})

// Get organization members
const { data: members } = await recal.getOrganizationsOrgSlugMembers({
  path: { orgSlug: 'acme-corp' },
  query: { include: ['oauthConnections'] }
})

// Add members to organization
const { data: result } = await recal.postOrganizationsOrgSlugMembers({
  path: { orgSlug: 'acme-corp' },
  body: { userIds: ['user-1', 'user-2'] }
})

// Remove members from organization
await recal.deleteOrganizationsOrgSlugMembers({
  path: { orgSlug: 'acme-corp' },
  body: { userIds: ['user-1'] }
})
```

### Calendars

```typescript
// List user's calendars
const { data: calendars } = await recal.getUsersUserIdCalendar({
  path: { userId: '123' },
  query: { provider: 'google' }
})

// Get busy times
const { data: busyTimes } = await recal.getUsersUserIdCalendarBusy({
  path: { userId: '123' },
  query: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z',
    provider: ['google', 'microsoft']
  }
})

// List events
const { data: events } = await recal.getUsersUserIdCalendarEvents({
  path: { userId: '123' },
  query: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z',
    provider: 'google'
  }
})
```

### Events

```typescript
import type { CreateEventAcrossCalendars } from 'recal-sdk'

// Create event across all calendars
const { data: event } = await recal.postUsersUserIdCalendarEventsMeta({
  path: { userId: '123' },
  body: {
    subject: 'Team Meeting',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T11:00:00Z',
    description: 'Monthly sync',
    attendees: [
      { email: 'alice@example.com' },
      { email: 'bob@example.com' }
    ],
    meeting: true, // Creates a meeting link
    sendNotificationsFor: ['google']
  },
  query: { provider: ['google', 'microsoft'] }
})

// Get event by metaId
const { data: foundEvent } = await recal.getUsersUserIdCalendarEventsMetaMetaId({
  path: { userId: '123', metaId: 'meta-123' }
})

// Update event by metaId
const { data: updated } = await recal.putUsersUserIdCalendarEventsMetaMetaId({
  path: { userId: '123', metaId: 'meta-123' },
  body: {
    subject: 'Updated Meeting',
    sendNotifications: true
  }
})

// Delete event by metaId
await recal.deleteUsersUserIdCalendarEventsMetaMetaId({
  path: { userId: '123', metaId: 'meta-123' }
})

// Create event for specific calendar
const { data: specificEvent } = await recal.postUsersUserIdCalendarEventsProviderCalendarId({
  path: {
    userId: '123',
    provider: 'google',
    calendarId: 'primary'
  },
  body: {
    subject: 'Specific Calendar Event',
    start: '2024-01-16T14:00:00Z',
    end: '2024-01-16T15:00:00Z',
    attendees: [{ email: 'team@example.com' }]
  }
})
```

### OAuth

```typescript
// Get all OAuth connections
const { data: connections } = await recal.getUsersUserIdOauth({
  path: { userId: '123' },
  query: { showToken: 'false' }
})

// Get specific OAuth connection
const { data: connection } = await recal.getUsersUserIdOauthProvider({
  path: { userId: '123', provider: 'google' }
})

// Create OAuth connection
const { data: newConnection } = await recal.postUsersUserIdOauthProvider({
  path: { userId: '123', provider: 'google' },
  body: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    email: 'user@gmail.com',
    expiresAt: '2024-12-31T23:59:59Z',
    scope: ['calendar.readonly']
  }
})

// Delete OAuth connection
await recal.deleteUsersUserIdOauthProvider({
  path: { userId: '123', provider: 'google' }
})

// Get OAuth auth link
const { data: authLink } = await recal.getUsersUserIdOauthProviderLink({
  path: { userId: '123', provider: 'google' },
  query: {
    provider: 'google',
    accessType: 'offline',
    scope: 'edit',
    redirectUrl: 'https://yourapp.com/oauth/callback'
  }
})

// Verify OAuth code
await recal.postUsersOauthProviderVerify({
  path: { provider: 'google' },
  body: {
    code: 'oauth-code',
    state: 'state-token',
    scope: ['calendar.edit']
  },
  query: { redirectUrl: 'https://yourapp.com/oauth/callback' }
})

// Get fresh access token
const { data: tokenData } = await recal.getUsersUserIdOauthProviderToken({
  path: { userId: '123', provider: 'google' },
  query: { redirectUrl: 'https://yourapp.com/oauth/callback' }
})
```

### Scheduling

```typescript
// Get available time slots (basic)
const { data: slots } = await recal.getUsersUserIdScheduling({
  path: { userId: '123' },
  query: {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '30', // 30 minutes
    padding: '15', // 15 minutes padding
    provider: 'google',
    earliestTimeEachDay: '09:00',
    latestTimeEachDay: '17:00',
    maxOverlaps: '0'
  }
})

// Get available time slots (advanced with custom schedules)
const { data: advancedSlots } = await recal.postUsersUserIdScheduling({
  path: { userId: '123' },
  query: {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '60',
    padding: '10'
  },
  body: {
    schedules: [
      {
        days: ['monday', 'wednesday', 'friday'],
        start: '09:00',
        end: '17:00'
      },
      {
        days: ['tuesday', 'thursday'],
        start: '10:00',
        end: '16:00'
      }
    ]
  }
})

// Get available slots for multiple users
const { data: multiUserSlots } = await recal.postUsersScheduling({
  query: {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '60',
    padding: '10'
  },
  body: {
    users: [
      {
        id: 'user-1',
        schedules: [
          { days: ['monday', 'tuesday'], start: '09:00', end: '17:00' }
        ]
      },
      {
        id: 'user-2',
        calendarIds: ['primary']
      }
    ]
  }
})

// Organization scheduling
const { data: orgSlots } = await recal.getOrganizationsOrgSlugScheduling({
  path: { orgSlug: 'acme-corp' },
  query: {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '30',
    padding: '15',
    provider: 'google'
  }
})

// Organization busy times
const { data: orgBusy } = await recal.getOrganizationsOrgSlugCalendarBusy({
  path: { orgSlug: 'acme-corp' },
  query: {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    primaryOnly: 'true',
    provider: 'google'
  }
})
```

## TypeScript Types

All types are fully typed and auto-generated from the OpenAPI spec:

```typescript
import type {
  User,
  Organization,
  Calendar,
  Event,
  AuthConnection,
  TimeRange,
  CreateEvent,
  UpdateEvent,
  Provider,
  CalendarAccessRole,
  GetUsersUserIdData,
  GetUsersUserIdResponse
} from 'recal-sdk'
```

## Error Handling

The SDK uses HeyAPI's built-in validation and error handling:

```typescript
try {
  const { data, error } = await recal.getUsersUserId({
    path: { userId: 'invalid-id' }
  })

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('User:', data)
  }
} catch (err) {
  console.error('Validation error:', err)
}
```

## Advanced: Direct SDK Access

For advanced use cases, you can access the HeyAPI SDK directly:

```typescript
import { RecalSDK, createClient, createConfig } from 'recal-sdk'

// Create custom client
const customClient = createClient(createConfig({
  baseUrl: 'https://api.recal.dev',
  headers: { Authorization: 'Bearer recal_...' }
}))

// Use SDK functions directly
const { data } = await RecalSDK.getUsers({ client: customClient })
```

## Environment Variables

Set these environment variables to avoid passing options:

```bash
RECAL_TOKEN=recal_...
RECAL_URL=https://api.recal.dev  # optional
```

Then simply:

```typescript
const recal = new Recal() // Uses env vars
```
