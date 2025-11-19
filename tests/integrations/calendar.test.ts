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

        // Set up OAuth connection using refresh token from environment
        await testClient.setupOAuthForUser(testUserId, 'google')
    })

    afterAll(async () => {
        await testClient.teardown('calendar')
    })

    test('should list calendars for a user', async () => {
        const calendars = await testClient.client.calendar.list(testUserId)

        expect(calendars).toBeDefined()
        expect(Array.isArray(calendars)).toBe(true)
        // With OAuth credentials, should return calendar list
    })

    test('should get busy times for a user', async () => {
        const now = new Date()
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

        const busyTimes = await testClient.client.calendar.getBusyTimes(testUserId, {
            start: now.toISOString(),
            end: endDate.toISOString(),
        })

        expect(busyTimes).toBeDefined()
        expect(Array.isArray(busyTimes)).toBe(true)
    })

    test('should list events for a user', async () => {
        const now = new Date()
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

        const events = await testClient.client.calendar.listEvents(testUserId, {
            start: now.toISOString(),
            end: endDate.toISOString(),
        })

        expect(events).toBeDefined()
        expect(Array.isArray(events)).toBe(true)
    })
})
