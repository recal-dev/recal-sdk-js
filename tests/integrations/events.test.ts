import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TestClient } from '../helpers/test-client'

// Note: Event tests require OAuth credentials to be set up for the user
// Skipping entire suite as it requires external OAuth provider setup
describe.skip('Events Integration Tests', () => {
    const testClient = new TestClient()

    let testUserId: string

    beforeAll(async () => {
        await testClient.setup()

        // Create a test user for event operations
        testUserId = testClient.generateTestId('events', 'test-user')
        await testClient.client.users.create(testUserId)
    })

    afterAll(async () => {
        await testClient.teardown('events')
    })

    // Note: Event tests require OAuth credentials to be set up for the user
    // These tests will fail with 400 errors if the user doesn't have OAuth connections

    test.skip('should create an event across calendars', async () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(14, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(15, 0, 0, 0)

        const event = await testClient.client.events.create(
            testUserId,
            {
                subject: 'Test Meeting',
                start: tomorrow.toISOString(),
                end: endTime.toISOString(),
                attendees: [{ email: 'test@example.com' }],
                meeting: true,
            },
            { provider: ['google'] }
        )

        expect(event).toBeDefined()
        expect(Array.isArray(event)).toBe(true)

        // Track the event for cleanup
        if (event.length > 0 && event[0].metaId) {
            testClient.trackEventMetaId(testUserId, event[0].metaId)
        }
    })

    test.skip('should get an event by metaId', async () => {
        // Create an event first
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 2)
        tomorrow.setHours(10, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(11, 0, 0, 0)

        const created = await testClient.client.events.create(
            testUserId,
            {
                subject: 'Get Test Event',
                start: tomorrow.toISOString(),
                end: endTime.toISOString(),
            },
            { provider: ['google'] }
        )

        if (created.length > 0 && created[0].metaId) {
            const metaId = created[0].metaId
            testClient.trackEventMetaId(testUserId, metaId)

            const event = await testClient.client.events.get(testUserId, metaId)

            expect(event).toBeDefined()
            expect(Array.isArray(event)).toBe(true)
            expect(event.length).toBeGreaterThan(0)
        }
    })

    test('should update an event by metaId', async () => {
        // Create an event first
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 3)
        tomorrow.setHours(16, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(17, 0, 0, 0)

        const created = await testClient.client.events.create(
            testUserId,
            {
                subject: 'Original Subject',
                start: tomorrow.toISOString(),
                end: endTime.toISOString(),
            },
            { provider: ['google'] }
        )

        if (created.length > 0 && created[0].metaId) {
            const metaId = created[0].metaId
            testClient.trackEventMetaId(testUserId, metaId)

            const updated = await testClient.client.events.update(testUserId, metaId, {
                subject: 'Updated Subject',
                sendNotifications: false,
            })

            expect(updated).toBeDefined()
            expect(Array.isArray(updated)).toBe(true)
        }
    })

    test('should delete an event by metaId', async () => {
        // Create an event first
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 4)
        tomorrow.setHours(9, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(10, 0, 0, 0)

        const created = await testClient.client.events.create(
            testUserId,
            {
                subject: 'Event to Delete',
                start: tomorrow.toISOString(),
                end: endTime.toISOString(),
            },
            { provider: ['google'] }
        )

        if (created.length > 0 && created[0].metaId) {
            const metaId = created[0].metaId

            const deleted = await testClient.client.events.delete(testUserId, metaId)

            expect(deleted).toBeDefined()
            // Event is deleted, so don't track it for cleanup
        }
    })

    test('should create an event for a specific calendar', async () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 5)
        tomorrow.setHours(11, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(12, 0, 0, 0)

        const event = await testClient.client.events.createForCalendar(testUserId, 'google', 'primary', {
            subject: 'Calendar Specific Event',
            start: tomorrow.toISOString(),
            end: endTime.toISOString(),
            attendees: [{ email: 'calendar-test@example.com' }],
        })

        expect(event).toBeDefined()

        // Track for cleanup if it has metaId
        if (event.metaId) {
            testClient.trackEventMetaId(testUserId, event.metaId)
        }
    })

    test('should get an event from a specific calendar', async () => {
        // Create an event first
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 6)
        tomorrow.setHours(13, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(14, 0, 0, 0)

        const created = await testClient.client.events.createForCalendar(testUserId, 'google', 'primary', {
            subject: 'Event to Retrieve',
            start: tomorrow.toISOString(),
            end: endTime.toISOString(),
        })

        if (created.id) {
            const event = await testClient.client.events.getFromCalendar(testUserId, 'google', 'primary', created.id)

            expect(event).toBeDefined()
            expect(event.id).toBe(created.id)

            if (event.metaId) {
                testClient.trackEventMetaId(testUserId, event.metaId)
            }
        }
    })

    test('should update an event in a specific calendar', async () => {
        // Create an event first
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 7)
        tomorrow.setHours(15, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(16, 0, 0, 0)

        const created = await testClient.client.events.createForCalendar(testUserId, 'google', 'primary', {
            subject: 'Event to Update',
            start: tomorrow.toISOString(),
            end: endTime.toISOString(),
        })

        if (created.id) {
            const updated = await testClient.client.events.updateForCalendar(
                testUserId,
                'google',
                'primary',
                created.id,
                {
                    subject: 'Updated Calendar Event',
                    sendNotifications: false,
                }
            )

            expect(updated).toBeDefined()
            expect(updated.id).toBe(created.id)

            if (updated.metaId) {
                testClient.trackEventMetaId(testUserId, updated.metaId)
            }
        }
    })

    test('should delete an event from a specific calendar', async () => {
        // Create an event first
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 8)
        tomorrow.setHours(17, 0, 0, 0)

        const endTime = new Date(tomorrow)
        endTime.setHours(18, 0, 0, 0)

        const created = await testClient.client.events.createForCalendar(testUserId, 'google', 'primary', {
            subject: 'Event to Delete from Calendar',
            start: tomorrow.toISOString(),
            end: endTime.toISOString(),
        })

        if (created.id) {
            const deleted = await testClient.client.events.deleteFromCalendar(
                testUserId,
                'google',
                'primary',
                created.id
            )

            expect(deleted).toBeDefined()
            // Event is deleted, so don't track for cleanup
        }
    })
})
