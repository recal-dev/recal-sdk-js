// MARK: Base Types

// Enums

/**
 * Provider enum
 */
export enum Provider {
    GOOGLE = 'google',
    MICROSOFT = 'microsoft',
}

/**
 * Calendar access roles enum
 */
export enum CalendarAccessRoles {
    FreeBusyReader = 'freeBusyReader',
    Reader = 'reader',
    Writer = 'writer',
    Owner = 'owner',
}

/**
 * Attendee response status enum
 */
export enum AttendeeResponseStatus {
    NeedsAction = 'needsAction',
    Accepted = 'accepted',
    Tentative = 'tentative',
    Declined = 'declined',
}

// Types

/**
 * Calendar type
 */
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

/**
 * Attendee type
 */
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

/**
 * Event type
 */
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

/**
 * Time range type
 */
export type TimeRange = {
    start: Date
    end: Date
}

/**
 * FreeBusy response type
 */
export type FreeBusy = {
    calendarId: string
    busy: TimeRange[]
}

// MARK: Function Types

/**
 * Base calendar request information
 */
export type CalendarRequest = {
    orgSlug: string
    userId: string
}

/**
 * Time range filter for calendar queries
 */
export type TimeRangeFilter = {
    timeMin: Date
    timeMax: Date
    provider?: Provider[]
}

/**
 * Event creation data for operations across multiple calendars
 */
export type CreateEventAcrossCalendars = {
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: {
        email: string
    }[]
    meeting?: {
        url: string
    }
    metaId?: string
    sendNotificationsFor?: Provider[]
}

/**
 * Event update data for operations across multiple calendars
 */
export type UpdateEventAcrossCalendars = {
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: {
        email: string
        responseStatus?: AttendeeResponseStatus
    }[]
    meeting?: {
        url: string
    }
    metaId?: string
    sendNotificationsFor?: Provider[]
}

/**
 * Event creation data for a specific calendar
 */
export type CreateEvent = {
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: {
        email: string
    }[]
    meeting?: {
        url: string
    }
    metaId?: string
    sendNotifications?: boolean
}

/**
 * Event update data for a specific calendar
 */
export type UpdateEvent = {
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: {
        email: string
        responseStatus?: AttendeeResponseStatus
    }[]
    meeting?: {
        url: string
    }
    metaId?: string
    sendNotifications?: boolean
}

/**
 * Specific calendar and event identifiers
 */
export type SpecificCalendarEvent = CalendarRequest & {
    provider: Provider
    calendarId: string
    eventId: string
}
