import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TestClient } from '../helpers/test-client'

describe('User Integration Tests', () => {
    const testClient = new TestClient()

    const primaryUserId = testClient.generateTestId('user', 'primary-user')
    const secondaryUserId = testClient.generateTestId('user', 'secondary-user')

    let testOrgSlug: string

    beforeAll(async () => {
        await testClient.setup()

        testOrgSlug = testClient.generateTestId('user', 'user-test-org')
        const testOrgName = testClient.generateTestId('user', 'User Test Org')
        await testClient.client.organizations.create(testOrgSlug, testOrgName)
    })

    afterAll(async () => {
        await testClient.teardown('user')
    })

    test('should create a user and return it', async () => {
        const user = await testClient.client.users.create(primaryUserId)

        expect(user).toBeDefined()
        expect(user.id).toBe(primaryUserId)
        expect(user.createdAt).toBeInstanceOf(Date)
    })

    test('should retrieve a user by ID', async () => {
        const user = await testClient.client.users.get(primaryUserId, {
            includeOrgs: false,
            includeOAuth: false,
        })

        expect(user).toBeDefined()
        expect(user?.id).toBe(primaryUserId)
        expect(user?.createdAt).toBeInstanceOf(Date)
    })

    test('should create a user with organization associations', async () => {
        const userWithOrgsId = testClient.generateTestId('user', 'user-with-orgs')
        const user = await testClient.client.users.create(userWithOrgsId, [testOrgSlug])

        expect(user).toBeDefined()
        expect(user.id).toBe(userWithOrgsId)
        expect(user.createdAt).toBeInstanceOf(Date)
    })

    test('should retrieve a user with organizations included', async () => {
        const userWithOrgsId = testClient.generateTestId('user', 'user-with-orgs-get')
        await testClient.client.users.create(userWithOrgsId, [testOrgSlug])

        const user = await testClient.client.users.get(userWithOrgsId, {
            includeOrgs: true,
            includeOAuth: false,
        })

        expect(user).toBeDefined()
        expect(user?.id).toBe(userWithOrgsId)
        expect(user?.createdAt).toBeInstanceOf(Date)

        if (user?.organizations) {
            expect(Array.isArray(user?.organizations)).toBe(true)
        }
    })

    test('should retrieve a user with OAuth connections included', async () => {
        const user = await testClient.client.users.get(primaryUserId, {
            includeOrgs: false,
            includeOAuth: true,
        })

        expect(user).toBeDefined()
        expect(user?.id).toBe(primaryUserId)
        expect(user?.createdAt).toBeInstanceOf(Date)

        if (user?.oauthConnections) {
            expect(Array.isArray(user?.oauthConnections)).toBe(true)
        }
    })

    test('should update a user', async () => {
        const user = await testClient.client.users.create(secondaryUserId)

        const updatedUserId = testClient.generateTestId('user', 'updated-user')

        const updatedUser = await testClient.client.users.update(user.id, {
            id: updatedUserId,
        })

        expect(updatedUser).toBeDefined()
        expect(updatedUser?.id).toBe(updatedUserId)
        expect(updatedUser?.createdAt).toBeInstanceOf(Date)
    })

    test('should list all users', async () => {
        const users = await testClient.client.users.listAll()

        expect(users).toBeDefined()
        expect(Array.isArray(users)).toBe(true)
        expect(users.length).toBeGreaterThan(0)

        const userIds = users.map((user) => user.id)
        expect(userIds).toContain(primaryUserId)

        for (const user of users) {
            expect(user.id).toBeDefined()
            expect(typeof user.id).toBe('string')
            expect(user.createdAt).toBeInstanceOf(Date)
        }
    })

    test('should delete a user', async () => {
        const tempUserId = testClient.generateTestId('user', 'temp-user')

        const tempUser = await testClient.client.users.create(tempUserId)
        expect(tempUser.id).toBe(tempUserId)

        const deletedUser = await testClient.client.users.delete(tempUserId)

        expect(deletedUser).toBeDefined()
        expect(deletedUser.id).toBe(tempUserId)
        expect(deletedUser.createdAt).toBeInstanceOf(Date)
    })
})
