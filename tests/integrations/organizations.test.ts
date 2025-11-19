import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TestClient } from '../helpers/test-client'

describe('Organization Integration Tests', () => {
    const testClient = new TestClient()

    const primaryOrgSlug = testClient.generateTestId('org', 'primary-org')
    const primaryOrgName = testClient.generateTestId('org', 'Primary Org')

    const secondaryOrgSlug = testClient.generateTestId('org', 'secondary-org')
    const secondaryOrgName = testClient.generateTestId('org', 'Secondary Org')

    beforeAll(async () => {
        await testClient.setup()
    })

    afterAll(async () => {
        await testClient.teardown('org')
    })

    test('should create an organization and return it', async () => {
        const org = await testClient.client.organizations.create(primaryOrgSlug, primaryOrgName)

        expect(org).toBeDefined()
        expect(org.slug).toBe(primaryOrgSlug)
        expect(org.name).toBe(primaryOrgName)
        expect(org.createdAt).toBeInstanceOf(Date)
    })

    test('should retrieve an organization by slug', async () => {
        const org = await testClient.client.organizations.get(primaryOrgSlug)

        expect(org).toBeDefined()
        expect(org.slug).toBe(primaryOrgSlug)
        expect(org.name).toBe(primaryOrgName)
        expect(org.createdAt).toBeInstanceOf(Date)
    })

    test('should update an organization', async () => {
        const org = await testClient.client.organizations.create(secondaryOrgSlug, secondaryOrgName)

        const updatedSlug = testClient.generateTestId('org', 'updated-org')
        const updatedName = testClient.generateTestId('org', 'Updated Org')

        const updatedOrg = await testClient.client.organizations.update(org.slug, {
            slug: updatedSlug,
            name: updatedName,
        })

        expect(updatedOrg).toBeDefined()
        expect(updatedOrg.slug).toBe(updatedSlug)
        expect(updatedOrg.name).toBe(updatedName)
        expect(updatedOrg.createdAt).toBeInstanceOf(Date)
    })

    test('should list all organizations', async () => {
        const orgs = await testClient.client.organizations.list()

        expect(orgs).toBeDefined()
        expect(Array.isArray(orgs)).toBe(true)
        expect(orgs.length).toBeGreaterThan(0)

        const orgSlugs = orgs.map((org) => org.slug)
        expect(orgSlugs).toContain(primaryOrgSlug)

        for (const org of orgs) {
            expect(org.slug).toBeDefined()
            expect(typeof org.slug).toBe('string')
            expect(org.createdAt).toBeInstanceOf(Date)
        }
    })

    test('should delete an organization', async () => {
        const tempSlug = testClient.generateTestId('org', 'temp-org')
        const tempName = testClient.generateTestId('org', 'Temp Org')

        const tempOrg = await testClient.client.organizations.create(tempSlug, tempName)
        expect(tempOrg.slug).toBe(tempSlug)

        const deletedOrg = await testClient.client.organizations.delete(tempSlug)

        expect(deletedOrg).toBeDefined()
        expect(deletedOrg.slug).toBe(tempSlug)
        expect(deletedOrg.name).toBe(tempName)
    })

    test('should get members of an organization', async () => {
        const members = await testClient.client.organizations.getMembers(primaryOrgSlug)

        expect(members).toBeDefined()
        expect(Array.isArray(members)).toBe(true)
    })

    test('should get members with include options', async () => {
        const members = await testClient.client.organizations.getMembers(primaryOrgSlug, {
            include: ['oauthConnections'],
        })

        expect(members).toBeDefined()
        expect(Array.isArray(members)).toBe(true)
    })

    test('should add members to an organization', async () => {
        // Has API issues with member management
        const memberOrgSlug = testClient.generateTestId('org', 'member-org')
        const memberOrgName = testClient.generateTestId('org', 'Member Org')
        const userId = testClient.generateTestId('org', 'member-user')

        await testClient.client.organizations.create(memberOrgSlug, memberOrgName)
        await testClient.client.users.create(userId)

        const result = await testClient.client.organizations.addMembers(memberOrgSlug, [userId])

        expect(result).toBeDefined()
        expect(result).toStartWith('1 users added successfully to')
    })

    test('should remove members from an organization', async () => {
        // Has API issues with member management
        const memberOrgSlug = testClient.generateTestId('org', 'remove-member-org')
        const memberOrgName = testClient.generateTestId('org', 'Remove Member Org')
        const userId = testClient.generateTestId('org', 'remove-member-user')

        await testClient.client.organizations.create(memberOrgSlug, memberOrgName)
        await testClient.client.users.create(userId, [memberOrgSlug])

        const result = await testClient.client.organizations.removeMembers(memberOrgSlug, [userId])

        expect(result).toBeDefined()
        expect(result).toStartWith('Users removed successfully from')
    })

    test('should get busy times for an organization', async () => {
        const now = new Date()
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

        const busyTimes = await testClient.client.organizations.getBusyTimes(primaryOrgSlug, {
            start: now.toISOString(),
            end: endDate.toISOString(),
        })

        expect(busyTimes).toBeDefined()
        expect(Array.isArray(busyTimes)).toBe(true)
    })

    test('should get busy times with provider filter', async () => {
        const now = new Date()
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const busyTimes = await testClient.client.organizations.getBusyTimes(primaryOrgSlug, {
            start: now.toISOString(),
            end: endDate.toISOString(),
            provider: 'google',
        })

        expect(busyTimes).toBeDefined()
        expect(Array.isArray(busyTimes)).toBe(true)
    })

    test('should get scheduling slots for an organization', async () => {
        // Create a user with OAuth for scheduling to work
        const schedulingUserId = testClient.generateTestId('org', 'scheduling-user')
        await testClient.client.users.create(schedulingUserId, [primaryOrgSlug])
        await testClient.setupOAuthForUser(schedulingUserId)

        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

        const result = await testClient.client.organizations.getScheduling(primaryOrgSlug, {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            slotDuration: '30',
            padding: '15',
        })

        expect(result).toBeDefined()
        expect(result.availableSlots).toBeDefined()
        expect(Array.isArray(result.availableSlots)).toBe(true)
    })

    test('should get scheduling slots with provider filter', async () => {
        // Create a user with OAuth for scheduling to work
        const schedulingUserId = testClient.generateTestId('org', 'scheduling-user-provider')
        await testClient.client.users.create(schedulingUserId, [primaryOrgSlug])
        await testClient.setupOAuthForUser(schedulingUserId)

        const now = new Date()
        const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const result = await testClient.client.organizations.getScheduling(primaryOrgSlug, {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            slotDuration: '60',
            padding: '10',
            provider: 'google',
        })

        expect(result).toBeDefined()
        expect(result.availableSlots).toBeDefined()
        expect(Array.isArray(result.availableSlots)).toBe(true)
    })
})
