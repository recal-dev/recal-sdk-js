import type { Static } from '@sinclair/typebox'
import type { attendeeSchema, busySchema, eventSchema, timeRangeSchema } from '../typebox/calendar.tb.js'

// MARK: Types
// Enums
/**
 * Provider enum
 */
export const providers = ['google', 'microsoft'] as const

export type Provider = (typeof providers)[number]

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
export type Attendee = Static<typeof attendeeSchema>

/**
 * Create attendee interface
 */
export interface CreateAttendee {
    email: string
}

/**
 * Event interface
 */
export type Event = Static<typeof eventSchema>

/**
 * Create event interface
 */
export interface CreateEvent {
    metaId?: string
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: CreateAttendee[]
    sendNotifications?: boolean
    meeting?: Meeting
}

/**
 * Create event across calendars interface
 */
export interface CreateEventAcrossCalendars {
    id?: string
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: CreateAttendee[]
    sendNotifications?: boolean
    meeting?: Meeting
}

/**
 * Update event interface
 */
export interface UpdateEvent {
    id?: string
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: CreateAttendee[]
    sendNotifications?: boolean
    meeting?: Meeting
}

/**
 * Update event across calendars interface
 */
export interface UpdateEventAcrossCalendars {
    metaId: string
    subject?: string
    description?: string
    start?: Date
    end?: Date
    location?: string
    attendees?: CreateAttendee[]
    sendNotificationsFor?: Provider[]
    meeting?: Meeting
}

/**
 * Time range interface
 */
export type TimeRange = Static<typeof timeRangeSchema>

/**
 * Busy response interface
 */
export type Busy = Static<typeof busySchema>
