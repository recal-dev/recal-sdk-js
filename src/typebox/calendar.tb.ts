import { Type as T } from '@sinclair/typebox'
import { AttendeeResponseStatus, providers } from '../types/calendar.types.js'

export const providerSchema = T.Union(providers.map((provider) => T.Literal(provider)))

export const attendeeResponseStatusSchema = T.Enum(AttendeeResponseStatus)

export const calendarSchema = T.Object({
    id: T.String(),
    timeZone: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    backgroundColor: T.Optional(T.String()),
    foregroundColor: T.Optional(T.String()),
    selected: T.Optional(T.Boolean()),
    accessRole: T.Optional(T.String()),
    original: T.Any(),
})

export const meetingSchema = T.Object({
    url: T.String(),
})

export const attendeeSchema = T.Union([
    T.Object({
        email: T.String(),
        responseStatus: T.Optional(attendeeResponseStatusSchema),
    }),
    T.Object({
        email: T.String(),
        self: T.Boolean(),
    }),
])

export const createAttendeeSchema = T.Object({
    email: T.String(),
})

export const eventSchema = T.Object({
    id: T.String(),
    metaId: T.Optional(T.String()),
    calendarId: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Array(attendeeSchema),
    original: T.Any(),
})

export const createEventSchema = T.Object({
    metaId: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Optional(T.Array(createAttendeeSchema)),
    sendNotifications: T.Optional(T.Boolean()),
    meeting: T.Optional(T.Union([T.Boolean(), meetingSchema])),
})

export const createEventAcrossCalendarsSchema = T.Object({
    id: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Optional(T.Array(createAttendeeSchema)),
    sendNotificationsFor: T.Optional(T.Array(providerSchema)),
    meeting: T.Optional(T.Union([T.Boolean(), meetingSchema])),
})

export const updateEventSchema = T.Object({
    id: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Optional(T.Array(createAttendeeSchema)),
    sendNotifications: T.Optional(T.Boolean()),
    meeting: T.Optional(T.Union([T.Boolean(), meetingSchema])),
})

export const updateEventAcrossCalendarsSchema = T.Object({
    metaId: T.String(),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Optional(T.Array(createAttendeeSchema)),
    sendNotificationsFor: T.Optional(T.Array(providerSchema)),
    meeting: T.Optional(T.Union([T.Boolean(), meetingSchema])),
})

export const timeRangeSchema = T.Object({
    start: T.Date(),
    end: T.Date(),
})

export const busySchema = T.Array(timeRangeSchema)
