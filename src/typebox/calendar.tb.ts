import { Type } from '@sinclair/typebox'
import { AttendeeResponseStatus, CalendarAccessRoles, Provider } from '../types/calendar.types'

export const providerSchema = Type.Enum(Provider)

export const calendarAccessRolesSchema = Type.Enum(CalendarAccessRoles)

export const attendeeResponseStatusSchema = Type.Enum(AttendeeResponseStatus)

export const calendarSchema = Type.Object({
    id: Type.String(),
    timeZone: Type.Optional(Type.String()),
    subject: Type.Optional(Type.String()),
    backgroundColor: Type.Optional(Type.String()),
    foregroundColor: Type.Optional(Type.String()),
    selected: Type.Optional(Type.Boolean()),
    accessRole: Type.Optional(calendarAccessRolesSchema),
    original: Type.Optional(Type.Unknown()),
})

export const meetingSchema = Type.Object({
    url: Type.String(),
})

export const attendeeSchema = Type.Intersect([
    Type.Object({
        email: Type.String(),
        original: Type.Unknown(),
    }),
    Type.Union([
        Type.Object({
            responseStatus: Type.Optional(attendeeResponseStatusSchema),
        }),
        Type.Object({
            self: Type.Literal(true),
        }),
    ]),
])

export const eventSchema = Type.Object({
    id: Type.String(),
    metaId: Type.Optional(Type.String()),
    subject: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    start: Type.Optional(Type.Date()),
    end: Type.Optional(Type.Date()),
    location: Type.Optional(Type.String()),
    attendees: Type.Array(attendeeSchema),
    meeting: Type.Optional(meetingSchema),
    original: Type.Unknown(),
})

export const timeRangeSchema = Type.Object({
    start: Type.Date(),
    end: Type.Date(),
})

export const freeBusySchema = Type.Object({
    calendarId: Type.String(),
    busy: Type.Array(timeRangeSchema),
})
