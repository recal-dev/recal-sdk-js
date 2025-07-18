// MARK: Types
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
export interface Calendar {
    id: string
    timeZone?: string
    subject?: string
    backgroundColor?: string
    foregroundColor?: string
    selected?: boolean
    accessRole?: CalendarAccessRoles
    original?: unknown
}

/**
 * Meeting interface
 */
export interface Meeting {
    url: string
}

/**
 * Attendee interface
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
 * Event interface
 */
export interface Event {
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
 * Time range interface
 */
export interface TimeRange {
    start: Date
    end: Date
}

/**
 * FreeBusy response interface
 */
export interface FreeBusy {
    calendarId: string
    busy: TimeRange[]
}
