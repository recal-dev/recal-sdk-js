// Enums
export enum Provider {
    GOOGLE = 'google',
    MICROSOFT = 'microsoft',
}

export enum CalendarAccessRoles {
    FreeBusyReader = 'freeBusyReader',
    Reader = 'reader',
    Writer = 'writer',
    Owner = 'owner',
}

export enum AttendeeResponseStatus {
    NeedsAction = 'needsAction',
    Accepted = 'accepted',
    Tentative = 'tentative',
    Declined = 'declined',
}

// Types

export type Calendar = {
    id: string
    timeZone?: string
    subject?: string
    backgroundColor?: string
    foregroundColor?: string
    selected?: boolean
    accessRole?: CalendarAccessRoles
    original?: unknown
}

export type Meeting = {
    url: string
}

export type Attendee = {
    email: string
    original: unknown
} & (
    | {
          responseStatus?: AttendeeResponseStatus
      }
    | {
          self: true
      }
)

export type Event = {
    id: string
    metaId?: string
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees: Attendee[]
    meeting?: Meeting
    original: unknown
}

export type TimeRange = {
    start: Date
    end: Date
}

export type FreeBusy = {
    calendarId: string
    busy: TimeRange[]
}
