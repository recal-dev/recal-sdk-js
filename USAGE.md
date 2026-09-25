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

Every call goes through one of six services — `users`, `organizations`, `calendar`, `events`, `oauth` and
`scheduling`. Each method resolves to the response payload and throws a `RecalError` if the API rejects the
call, so there is no envelope to unwrap by hand. The availability methods are the exception: they resolve
to a payload plus the calendars or users they could not read. See [Partial answers](#partial-answers).

## Basic Examples

### Users

```typescript
import { Recal } from 'recal-sdk'

const recal = new Recal({ token: 'recal_...' })

// Get all users
const users = await recal.users.list()

// Get a specific user with relations
const user = await recal.users.get('user-123', {
  include: ['organizations', 'oauthConnections']
})

// Create a user, optionally adding it to organizations by slug
const newUser = await recal.users.create('user-123', ['acme-corp', 'acme-eu'])

// Rename a user
const renamedUser = await recal.users.update('user-123', 'user-456')

// Delete a user
await recal.users.delete('user-123')

// List the organizations a user belongs to
const userOrgs = await recal.users.getOrganizations('user-123')
```

### Organizations

```typescript
// List all organizations
const orgs = await recal.organizations.list()

// Get organization
const org = await recal.organizations.get('acme-corp')

// Create organization
const newOrg = await recal.organizations.create('acme-corp', 'Acme Corporation')

// Update organization
const updatedOrg = await recal.organizations.update('acme-corp', {
  slug: 'acme-corp',
  name: 'Acme Corp (Updated)'
})

// Delete organization
await recal.organizations.delete('acme-corp')

// Get organization members
const members = await recal.organizations.getMembers('acme-corp', {
  include: ['oauthConnections']
})

// Add members to organization
await recal.organizations.addMembers('acme-corp', ['user-1', 'user-2'])

// Remove members from organization
await recal.organizations.removeMembers('acme-corp', ['user-1'])
```

### Calendars

```typescript
// List user's calendars
const calendars = await recal.calendar.list('user-123', { provider: 'google' })

// Get busy times. `failedCalendars` names every calendar that could not be read, and is
// `[]` when all of them were — see "Partial answers" below
const { data: busyTimes, failedCalendars } = await recal.calendar.getBusyTimes('user-123', {
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-31T23:59:59Z',
  provider: ['google', 'microsoft']
})

if (failedCalendars.length > 0) {
  // `busyTimes` is real but incomplete: a window these calendars cover may look free
  for (const calendar of failedCalendars) {
    console.warn(calendar.provider, calendar.calendarId, calendar.reason, calendar.message)
  }
}

// List events
const events = await recal.calendar.listEvents('user-123', {
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-31T23:59:59Z',
  provider: 'google'
})
```

### Events

```typescript
import type { CreateMetaEvent } from 'recal-sdk'

// Create one event across several calendars, addressed afterwards by its metaId
const event = await recal.events.createMetaEvent(
  'user-123',
  {
    subject: 'Team Meeting',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T11:00:00Z',
    description: 'Monthly sync',
    attendees: [{ email: 'alice@example.com' }, { email: 'bob@example.com' }],
    meeting: true, // Creates a meeting link
    sendNotificationsFor: ['google']
  } satisfies CreateMetaEvent,
  { provider: ['google', 'microsoft'] }
)

// Get event by metaId
const foundEvent = await recal.events.getMetaEvent('user-123', 'meta-123')

// Update event by metaId
const updatedEvent = await recal.events.updateMetaEvent('user-123', 'meta-123', {
  subject: 'Updated Meeting',
  sendNotifications: true
})

// Delete event by metaId
await recal.events.deleteMetaEvent('user-123', 'meta-123')

// Create an event in one specific calendar
const specificEvent = await recal.events.createEvent('user-123', 'google', 'primary', {
  subject: 'Specific Calendar Event',
  start: '2024-01-16T14:00:00Z',
  end: '2024-01-16T15:00:00Z',
  attendees: [{ email: 'team@example.com' }]
})

// Read, update and delete an event in one specific calendar
const singleEvent = await recal.events.getEvent('user-123', 'google', 'primary', 'event-id')
await recal.events.updateEvent('user-123', 'google', 'primary', 'event-id', {
  subject: 'Updated Title'
})
await recal.events.deleteEvent('user-123', 'google', 'primary', 'event-id')
```

### OAuth

```typescript
// Get all OAuth connections
const connections = await recal.oauth.list('user-123', { showToken: 'false' })

// Get specific OAuth connection
const connection = await recal.oauth.get('user-123', 'google')

// Create an OAuth connection from tokens you already hold
const newConnection = await recal.oauth.create('user-123', 'google', {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  email: 'user@gmail.com',
  expiresAt: '2024-12-31T23:59:59Z',
  scope: ['calendar.readonly']
})

// Delete OAuth connection
await recal.oauth.delete('user-123', 'google')

// Get one auth link per provider, to send the user to consent
const authLinks = await recal.oauth.getAuthLinks('user-123', {
  accessType: 'offline',
  scope: 'edit'
})

// Get the auth link for a single provider
const { link } = await recal.oauth.getAuthLink('user-123', 'google', {
  accessType: 'offline',
  scope: 'edit',
  redirectUrl: 'https://yourapp.com/oauth/callback'
})

// Verify the code the provider redirected back with — the connection is not
// persisted until this succeeds
await recal.oauth.verifyCode(
  'google',
  { code: 'oauth-code', state: 'state-token', scope: ['edit'] },
  { redirectUrl: 'https://yourapp.com/oauth/callback' }
)

// Get a fresh access token, refreshed if the stored one has expired
const { accessToken } = await recal.oauth.getFreshAccessToken('user-123', 'google')
```

The full connection flow, including what to forward from your redirect handler, is in
[README.md](./README.md#calendar-connection-flow).

### Scheduling

```typescript
// Get available time slots (basic)
const slots = await recal.scheduling.getSlots('user-123', {
  start: '2024-01-15T00:00:00Z',
  end: '2024-01-19T23:59:59Z',
  slotDuration: '30', // 30 minutes
  padding: '15', // 15 minutes padding
  provider: 'google',
  earliestTimeEachDay: '09:00',
  latestTimeEachDay: '17:00',
  maxOverlaps: '0'
})
// => { availableSlots, options }

// Get available time slots (advanced with custom schedules)
const advancedSlots = await recal.scheduling.getAdvancedSlots(
  'user-123',
  {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '60',
    padding: '10'
  },
  {
    schedules: [
      { days: ['monday', 'wednesday', 'friday'], start: '09:00', end: '17:00' },
      { days: ['tuesday', 'thursday'], start: '10:00', end: '16:00' }
    ]
  }
)

// Get available slots for multiple users — one entry per user, each either
// `status: 'ok'` or `status: 'error'`
const multiUserSlots = await recal.scheduling.getMultiUserSlots(
  {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '60',
    padding: '10'
  },
  {
    users: [
      {
        id: 'user-1',
        schedules: [{ days: ['monday', 'tuesday'], start: '09:00', end: '17:00' }]
      },
      { id: 'user-2', calendarIds: ['primary'] }
    ]
  }
)

for (const entry of multiUserSlots) {
  if (entry.status === 'error') {
    // No slots at all for this user; `reason` says why when the API could name one
    console.warn(entry.userId, entry.error, entry.reason)
  } else if (entry.failedCalendars.length > 0) {
    // Slots were computed, but from an incomplete picture of this user's calendars
    console.warn(entry.userId, entry.failedCalendars)
  }
}

// Organization scheduling — `failedUsers` names the members that could not be read
const { data: orgSlots, failedUsers: schedulingFailures } = await recal.organizations.getScheduling(
  'acme-corp',
  {
    start: '2024-01-15T00:00:00Z',
    end: '2024-01-19T23:59:59Z',
    slotDuration: '30',
    padding: '15',
    provider: 'google'
  }
)

// Organization busy times — same envelope
const { data: orgBusy, failedUsers: busyFailures } = await recal.organizations.getBusyTimes('acme-corp', {
  start: '2024-01-15T00:00:00Z',
  end: '2024-01-19T23:59:59Z',
  primaryOnly: 'true',
  provider: 'google'
})
```

## Partial answers

A free/busy or scheduling request fans out over many calendars, and one of them being unreadable — a
revoked authorization, a throttled provider, a calendar that is no longer shared — does not fail the whole
request. The API answers with what it has and names what it could not read beside it.

| Method | Failure list | Where it lives |
|---|---|---|
| `calendar.getBusyTimes()` | `failedCalendars: FailedCalendar[]` | beside `data` |
| `organizations.getBusyTimes()` | `failedUsers: FailedFreeBusyUser[]` | beside `data` |
| `organizations.getScheduling()` | `failedUsers: FailedFreeBusyUser[]` | beside `data` |
| `scheduling.getMultiUserSlots()` | `failedCalendars` on each `ok` entry, `reason` on each `error` entry | inside each entry |

`scheduling.getSlots()` and `scheduling.getAdvancedSlots()` cover one user's own calendars and carry no
failure list.

**A non-empty list means the answer is incomplete.** Busy times missing a calendar make a window that
calendar covers look free when it is not, and slots computed from them are free time the user does not
have. Treat it as a decision — surface the gap, retry, or refuse to book — rather than letting a partial
answer reach a booking as if it were complete.

The lists are always present, `[]` when nothing failed, so `.length` needs no guard:

```typescript
const { data: busyTimes, failedCalendars } = await recal.calendar.getBusyTimes('user-123', {
  start: '2024-01-15T00:00:00Z',
  end: '2024-01-19T23:59:59Z'
})

if (failedCalendars.length > 0) {
  throw new Error(`Availability is incomplete: ${failedCalendars.map((c) => c.calendarId).join(', ')}`)
}
```

A `FailedFreeBusyUser` distinguishes *no* answer from a *partial* one. Its own `failedCalendars` being
**empty** means that user contributed nothing at all; **non-empty** means their busy times are real but
have gaps, and names the calendars behind them.

Every failure carries a `reason` — a `FreeBusyFailureReason`, a closed ten-value union whose codes are
never renamed or removed once shipped — and a `message` fit to show an end user. What each reason means
and how to resolve it: [docs.recal.dev/core/troubleshooting](https://docs.recal.dev/core/troubleshooting).

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
  CreateMetaEvent,
  UpdateEvent,
  Provider,
  CalendarAccessRole,
  FailedCalendar,
  FailedFreeBusyUser,
  FreeBusyFailureReason,
  GetV1UsersByUserIdData,
  GetV1UsersByUserIdResponse
} from 'recal-sdk'
```

The per-operation types are named after the route, each path parameter contributing a `By<Param>` segment:
`GetV1UsersByUserIdData` is the request for `GET /v1/users/{userId}`, `GetV1UsersByUserIdResponse` its
response.

## Error Handling

Service methods resolve to the payload, or throw a `RecalError` carrying the HTTP status and the raw error
body:

```typescript
import { Recal, RecalError } from 'recal-sdk'

try {
  const user = await recal.users.get('unknown-user')
} catch (error) {
  if (error instanceof RecalError) {
    console.error(error.statusCode, error.message, error.details)
  } else {
    throw error
  }
}
```

A partial answer is not an error and never throws — see [Partial answers](#partial-answers).

## Advanced: Direct SDK Access

For advanced use cases, you can access the HeyAPI SDK directly. Its functions return HeyAPI's
`{ data, error }` result rather than the payload, and never throw:

```typescript
import { createClient, createConfig, RecalSDK } from 'recal-sdk'

// Create custom client
const customClient = createClient(createConfig({
  baseUrl: 'https://api.recal.dev',
  headers: { Authorization: 'Bearer recal_...' }
}))

// Use SDK functions directly
const { data, error } = await RecalSDK.getV1Users({ client: customClient })
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
