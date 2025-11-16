import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TestClient } from '../helpers/test-client'

describe('Calendar Integration Tests', () => {
    const testClient = new TestClient()

    let testUserId: string

    beforeAll(async () => {
        await testClient.setup()

        // Create a test user for calendar operations
        testUserId = testClient.generateTestId('calendar', 'test-user')
        await testClient.client.users.create(testUserId)
    })

    afterAll(async () => {
        await testClient.teardown('calendar')
    })

    test('should list calendars for a user (returns empty without OAuth)', async () => {
        const calendars = await testClient.client.calendar.list(testUserId)

        expect(calendars).toBeDefined()
        expect(Array.isArray(calendars)).toBe(true)
        // Without OAuth credentials, this returns an empty array
        expect(calendars.length).toBe(0)
    })

    test('should get busy times for a user (returns empty without OAuth)', async () => {
        const now = new Date()
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

        const busyTimes = await testClient.client.calendar.getBusyTimes(testUserId, {
            start: now.toISOString(),
            end: endDate.toISOString(),
        })

        expect(busyTimes).toBeDefined()
        expect(Array.isArray(busyTimes)).toBe(true)
        // Without OAuth credentials, this returns an empty array
        expect(busyTimes.length).toBe(0)
    })

    test('should list events for a user (returns empty without OAuth)', async () => {
        const now = new Date()
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

        const events = await testClient.client.calendar.listEvents(testUserId, {
            start: now.toISOString(),
            end: endDate.toISOString(),
        })

        expect(events).toBeDefined()
        expect(Array.isArray(events)).toBe(true)
        // Without OAuth credentials, this returns an empty array
        expect(events.length).toBe(0)
    })
})
