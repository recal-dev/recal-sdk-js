import { describe, expect, test } from 'bun:test'
import { SchedulingService } from '@/services/scheduling.service'

const OPTIONS = {
    start: '2026-10-01T00:00:00.000Z',
    end: '2026-10-02T00:00:00.000Z',
    padding: 0,
    slotDuration: 30,
    maxOverlaps: 0,
}

const healthy = () => ({
    userId: 'has_calendar',
    status: 'ok',
    availableSlots: [{ start: '2026-10-01T09:00:00.000Z', end: '2026-10-01T09:30:00.000Z' }],
    options: { ...OPTIONS },
})

const unresolved = () => ({
    userId: 'no_calendar',
    status: 'error',
    error: 'User has no connected calendars',
})

/**
 * Drives the real service against a stubbed client, so the transformer under test is the
 * one the service actually installs rather than a copy of it.
 */
async function callWith(entries: unknown[]) {
    const client = {
        post: async (opts: { responseTransformer?: (d: unknown) => Promise<unknown> }) => ({
            data: await opts.responseTransformer?.({ data: entries }),
        }),
    }
    return (await new SchedulingService(client as never).getMultiUserSlots({} as never, { users: [] })) as Array<
        Record<string, unknown>
    >
}

describe('getMultiUserSlots response handling', () => {
    test("keeps a healthy user's slots when another user in the batch is unresolved", async () => {
        const [ok, failed] = await callWith([healthy(), unresolved()])

        expect((ok.availableSlots as unknown[]).length).toBe(1)
        expect(failed.error).toBe('User has no connected calendars')
    })

    test('survives an unresolved entry in first position', async () => {
        const [failed, ok] = await callWith([unresolved(), healthy()])

        expect(failed.error).toBe('User has no connected calendars')
        expect((ok.availableSlots as unknown[]).length).toBe(1)
    })

    test('converts slot and option boundaries to Date on successful entries', async () => {
        const [ok] = await callWith([healthy()])
        const slot = (ok.availableSlots as Array<Record<string, unknown>>)[0]
        const options = ok.options as Record<string, unknown>

        expect(slot.start).toBeInstanceOf(Date)
        expect(slot.end).toBeInstanceOf(Date)
        expect(options.start).toBeInstanceOf(Date)
        expect(options.end).toBeInstanceOf(Date)
    })

    test('leaves an unresolved entry untouched rather than inventing empty availability', async () => {
        const [failed] = await callWith([unresolved()])

        expect(failed.availableSlots).toBeUndefined()
        expect(failed.status).toBe('error')
    })
})
