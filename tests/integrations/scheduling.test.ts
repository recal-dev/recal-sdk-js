import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TestClient } from '../helpers/test-client'

describe('Scheduling Integration Tests', () => {
    const testClient = new TestClient()

    let testUserId: string
    let secondUserId: string

    beforeAll(async () => {
        await testClient.setup()

        // Create test users for scheduling operations
        testUserId = testClient.generateTestId('scheduling', 'test-user-1')
        secondUserId = testClient.generateTestId('scheduling', 'test-user-2')

        await testClient.client.users.create(testUserId)
        await testClient.client.users.create(secondUserId)

        // Set up OAuth connections for both users
        await testClient.setupOAuthForUser(testUserId, 'google')
        await testClient.setupOAuthForUser(secondUserId, 'google')
    })

    afterAll(async () => {
        await testClient.teardown('scheduling')
    })

    test('should get available time slots for a user', async () => {
        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

        const slots = await testClient.client.scheduling.getSlots(testUserId, {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            slotDuration: '30',
            padding: '15',
        })

        expect(slots).toBeDefined()
        expect(Array.isArray(slots)).toBe(true)
    })

    test('should get available slots with provider filter', async () => {
        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const slots = await testClient.client.scheduling.getSlots(testUserId, {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            slotDuration: '60',
            padding: '0',
            provider: 'google',
        })

        expect(slots).toBeDefined()
        expect(Array.isArray(slots)).toBe(true)
    })

    test('should get advanced slots with custom schedules', async () => {
        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const slots = await testClient.client.scheduling.getAdvancedSlots(
            testUserId,
            {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                slotDuration: '30',
                padding: '10',
            },
            {
                schedules: [
                    {
                        days: ['monday', 'wednesday', 'friday'],
                        start: '09:00',
                        end: '17:00',
                    },
                ],
            }
        )

        expect(slots).toBeDefined()
        expect(Array.isArray(slots)).toBe(true)
    })

    test('should get advanced slots with multiple custom schedules', async () => {
        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const slots = await testClient.client.scheduling.getAdvancedSlots(
            testUserId,
            {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                slotDuration: '60',
                padding: '15',
            },
            {
                schedules: [
                    {
                        days: ['monday', 'tuesday', 'wednesday'],
                        start: '09:00',
                        end: '12:00',
                    },
                    {
                        days: ['thursday', 'friday'],
                        start: '13:00',
                        end: '17:00',
                    },
                ],
            }
        )

        expect(slots).toBeDefined()
        expect(Array.isArray(slots)).toBe(true)
    })

    test('should get available slots for multiple users', async () => {
        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const slots = await testClient.client.scheduling.getMultiUserSlots(
            {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                slotDuration: '30',
                padding: '15',
            },
            {
                users: [{ id: testUserId }, { id: secondUserId }],
            }
        )

        expect(slots).toBeDefined()
        expect(Array.isArray(slots)).toBe(true)
    })

    test('should get multi-user slots with custom schedules', async () => {
        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const slots = await testClient.client.scheduling.getMultiUserSlots(
            {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                slotDuration: '60',
                padding: '10',
            },
            {
                users: [
                    {
                        id: testUserId,
                        schedules: [
                            {
                                days: ['monday', 'wednesday', 'friday'],
                                start: '09:00',
                                end: '17:00',
                            },
                        ],
                    },
                    {
                        id: secondUserId,
                        schedules: [
                            {
                                days: ['tuesday', 'thursday'],
                                start: '10:00',
                                end: '16:00',
                            },
                        ],
                    },
                ],
            }
        )

        expect(slots).toBeDefined()
        expect(Array.isArray(slots)).toBe(true)
    })
})
