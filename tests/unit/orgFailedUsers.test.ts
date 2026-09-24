import { describe, expect, test } from 'bun:test'
import { OrganizationsService } from '@/services/organizations.service'
import { RecalError } from '@/utils/response'

const FAILED = [{ customId: 'no_calendar', reason: 'The user has not connected the requested calendar provider' }]

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

    test('an api error still throws RecalError rather than returning an envelope', async () => {
        const service = new OrganizationsService(
            clientReturning(undefined, { error: 'Organization with slug acme not found' })
        )

        await expect(service.getBusyTimes('acme', {} as never)).rejects.toBeInstanceOf(RecalError)
    })
})
