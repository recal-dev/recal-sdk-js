import { Type as T } from '@sinclair/typebox'
import { AttendeeResponseStatus, CalendarAccessRoles, Provider } from '../types/calendar.types'

export const providerSchema = T.Enum(Provider)

export const calendarAccessRolesSchema = T.Enum(CalendarAccessRoles)

export const attendeeResponseStatusSchema = T.Enum(AttendeeResponseStatus)

export const calendarSchema = T.Object({
    id: T.String(),
    timeZone: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    backgroundColor: T.Optional(T.String()),
    foregroundColor: T.Optional(T.String()),
    selected: T.Optional(T.Boolean()),
    accessRole: T.Optional(calendarAccessRolesSchema),
    original: T.Optional(T.Unknown()),
})

export const meetingSchema = T.Object({
    url: T.String(),
})

export const attendeeSchema = T.Intersect([
    T.Object({
        email: T.String(),
        original: T.Unknown(),
    }),
    T.Union([
        T.Object({
            responseStatus: T.Optional(attendeeResponseStatusSchema),
        }),
        T.Object({
            self: T.Literal(true),
        }),
    ]),
])

export const createAttendeeSchema = T.Object({
    email: T.String(),
})

export const eventSchema = T.Object({
    id: T.String(),
    metaId: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Array(attendeeSchema),
    meeting: T.Optional(meetingSchema),
    original: T.Unknown(),
})

export const createEventSchema = T.Object({
    metaId: T.Optional(T.String()),
    subject: T.Optional(T.String()),
    description: T.Optional(T.String()),
    start: T.Optional(T.Date()),
    end: T.Optional(T.Date()),
    location: T.Optional(T.String()),
    attendees: T.Optional(T.Array(createAttendeeSchema)),
    sendNotifications: T.Boolean(),
    meeting: T.Optional(T.Union([T.Boolean(), meetingSchema])),
})

export const timeRangeSchema = T.Object({
    start: T.Date(),
    end: T.Date(),
})

export const freeBusySchema = T.Object({
    calendarId: T.String(),
    busy: T.Array(timeRangeSchema),
})
