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

const clientReturning = (body: unknown, error?: unknown) =>
    ({ get: async () => ({ data: error ? undefined : body, error }) }) as never

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

    test('an api error still throws RecalError rather than returning an envelope', async () => {
        const service = new OrganizationsService(
            clientReturning(undefined, { error: 'Organization with slug acme not found' })
        )

        await expect(service.getBusyTimes('acme', {} as never)).rejects.toBeInstanceOf(RecalError)
    })
})
