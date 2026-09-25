import { describe, expect, test } from 'bun:test'
import type { FailedFreeBusyUser } from '@/client/types.gen'
import { OrganizationsService } from '@/services/organizations.service'
import { RecalError } from '@/utils/response'

const FAILED: FailedFreeBusyUser[] = [
    {
        customId: 'deconfigured_provider',
        reason: 'providerNotConfigured',
        message: 'The organization has not configured this calendar provider',
        failedCalendars: [],
    },
    {
        customId: 'one_bad_calendar',
        reason: 'accessDenied',
        message: 'The calendar is not shared with this user',
        failedCalendars: [
            {
                calendarId: 'shared@example.com',
                provider: 'google',
                reason: 'accessDenied',
                message: 'The calendar is not shared with this user',
            },
        ],
    },
]

const clientReturning = (body: unknown, error?: unknown, status?: number) =>
    ({ get: async () => ({ data: error ? undefined : body, error, response: { status } }) }) as never

describe('organization free/busy envelopes', () => {
    test('getBusyTimes reports the users whose calendars could not be read', async () => {
        const service = new OrganizationsService(
            clientReturning({
                data: [{ start: '2026-10-01T09:00:00.000Z', end: '2026-10-01T10:00:00.000Z' }],
                failedUsers: FAILED,
            })
        )

        const result = await service.getBusyTimes('acme', {} as never)

        expect(result.data.length).toBe(1)
        expect(result.failedUsers).toEqual(FAILED)
    })

    test('getScheduling reports them too, beside the slots', async () => {
        const service = new OrganizationsService(
            clientReturning({ data: { availableSlots: [], options: {} }, failedUsers: FAILED })
        )

        const result = await service.getScheduling('acme', {} as never)

        expect(result.data.availableSlots).toEqual([])
        expect(result.failedUsers).toEqual(FAILED)
    })

    test('a failed user distinguishes no answer at all from a partial one', async () => {
        const service = new OrganizationsService(clientReturning({ data: [], failedUsers: FAILED }))

        const [missing, incomplete] = (await service.getBusyTimes('acme', {} as never)).failedUsers

        // `failedCalendars` empty means the user contributed nothing; non-empty means the
        // busy times are real but have gaps, and names which calendars are missing.
        expect(missing.failedCalendars).toEqual([])
        expect(incomplete.failedCalendars[0].calendarId).toBe('shared@example.com')
    })

    test("an api error throws RecalError carrying the api's own status and message", async () => {
        const service = new OrganizationsService(
            clientReturning(undefined, { error: 'Organization with slug acme not found' }, 404)
        )

        // Asserting only `instanceof RecalError` would pass even with the error branch deleted:
        // the fake's `data: undefined` trips the no-data guard, which throws a RecalError too,
        // just a generic one. The status and the API's message are what prove the error path ran.
        const error = (await service.getBusyTimes('acme', {} as never).catch((e) => e)) as RecalError
        expect(error).toBeInstanceOf(RecalError)
        expect(error.statusCode).toBe(404)
        expect(error.message).toContain('Organization with slug acme not found')
    })
})
