import { describe, expect, test } from 'bun:test'
import type { FailedCalendar } from '@/client/types.gen'
import { CalendarService } from '@/services/calendar.service'
import { RecalError } from '@/utils/response'

// The transformer turns these into `Date`s in the declared response type; the fake client
// below returns the wire shape unchanged, so assert on the envelope rather than on values.
const BUSY = [{ start: '2026-10-01T09:00:00.000Z', end: '2026-10-01T10:00:00.000Z' }]

const FAILED: FailedCalendar[] = [
    {
        calendarId: 'shared@example.com',
        provider: 'google',
        reason: 'accessDenied',
        message: 'The calendar is not shared with this user',
    },
]

const clientReturning = (body: unknown, error?: unknown, status?: number) =>
    ({ get: async () => ({ data: error ? undefined : body, error, response: { status } }) }) as never

describe('user free/busy envelope', () => {
    test('getBusyTimes reports the calendars it could not read beside the busy times', async () => {
        const service = new CalendarService(clientReturning({ data: BUSY, failedCalendars: FAILED }))

        const result = await service.getBusyTimes('user-123', {} as never)

        expect(result.data.length).toBe(1)
        expect(result.failedCalendars).toEqual(FAILED)
    })

    test('failedCalendars is present and empty when every calendar was read', async () => {
        const service = new CalendarService(clientReturning({ data: BUSY, failedCalendars: [] }))

        const result = await service.getBusyTimes('user-123', {} as never)

        // Always present, so a caller can branch on `.length` without a guard.
        expect(result.failedCalendars).toEqual([])
    })

    test("an api error throws RecalError carrying the api's own status and message", async () => {
        const service = new CalendarService(clientReturning(undefined, { error: 'User not found' }, 404))

        // `instanceof RecalError` alone is not enough: the fake's `data: undefined` trips the
        // no-data guard, which throws one too. The status and message pin the error branch.
        const error = (await service.getBusyTimes('user-123', {} as never).catch((e) => e)) as RecalError
        expect(error).toBeInstanceOf(RecalError)
        expect(error.statusCode).toBe(404)
        expect(error.message).toContain('User not found')
    })
})
