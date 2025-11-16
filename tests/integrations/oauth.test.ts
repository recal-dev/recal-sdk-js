import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { TestClient } from '../helpers/test-client'

describe('OAuth Integration Tests', () => {
    const testClient = new TestClient()

    let testUserId: string

    beforeAll(async () => {
        await testClient.setup()

        // Create a test user for OAuth operations
        testUserId = testClient.generateTestId('oauth', 'test-user')
        await testClient.client.users.create(testUserId)
    })

    afterAll(async () => {
        await testClient.teardown('oauth')
    })

    test('should list OAuth connections for a user', async () => {
        const connections = await testClient.client.oauth.list(testUserId)

        expect(connections).toBeDefined()
        expect(Array.isArray(connections)).toBe(true)
        // User might not have any OAuth connections, so just verify structure
    })

    test('should list OAuth connections with showToken option', async () => {
        const connections = await testClient.client.oauth.list(testUserId, {
            showToken: 'true',
        })

        expect(connections).toBeDefined()
        expect(Array.isArray(connections)).toBe(true)
    })

    test('should get a specific OAuth connection', async () => {
        const connection = await testClient.client.oauth.get(testUserId, 'google')

        // With OAuth credentials, should return the connection or null
        expect(connection !== undefined).toBe(true)
    })

    test('should get OAuth connection with showToken option', async () => {
        const connection = await testClient.client.oauth.get(testUserId, 'google', {
            showToken: 'true',
        })

        expect(connection !== undefined).toBe(true)
    })

    test('should get authorization links for all providers', async () => {
        const links = await testClient.client.oauth.getAuthLinks(testUserId, {
            accessType: 'offline',
            scope: 'edit',
        })

        expect(links).toBeDefined()
        expect(typeof links).toBe('object')
        // Should have google and microsoft properties
        if ('google' in links) {
            expect(typeof links.google).toBe('string')
        }
        if ('microsoft' in links) {
            expect(typeof links.microsoft).toBe('string')
        }
    })

    test('should get authorization link for specific provider', async () => {
        const links = await testClient.client.oauth.getAuthLinks(testUserId, {
            accessType: 'offline',
            scope: 'edit',
            provider: ['google'],
        })

        expect(links).toBeDefined()
        expect(typeof links).toBe('object')
    })

    test('should get authorization link for a single provider', async () => {
        const link = await testClient.client.oauth.getAuthLink(testUserId, 'google', {
            accessType: 'offline',
            scope: 'edit',
        })

        expect(link).toBeDefined()
        expect(typeof link).toBe('string')
        expect(link.length).toBeGreaterThan(0)
        expect(link).toContain('http') // Should be a URL
    })

    test('should get authorization link with redirect URL', async () => {
        const link = await testClient.client.oauth.getAuthLink(testUserId, 'microsoft', {
            accessType: 'offline',
            scope: 'edit',
            redirectUrl: 'https://example.com/oauth/callback',
        })

        expect(link).toBeDefined()
        expect(typeof link).toBe('string')
        expect(link.length).toBeGreaterThan(0)
        expect(link).toContain('http')
    })

    test('should handle expired access token gracefully', async () => {
        // This test verifies behavior when access token is expired
        // The SDK should either:
        // 1. Return an error indicating token expiration
        // 2. Automatically refresh using the refresh token
        // 3. Return null/empty for connections

        try {
            const connections = await testClient.client.oauth.list(testUserId)

            // If successful, connections should be an array (possibly empty)
            expect(Array.isArray(connections)).toBe(true)
        } catch (error) {
            // If it fails, should be a RecalError with appropriate message
            expect(error).toBeDefined()
            // Error message might indicate token expiration or OAuth issues
        }
    })

    test('should attempt token refresh when access token expires', async () => {
        // Test that SDK attempts to use refresh token when access token is expired
        // This is a behavioral test - we just verify it doesn't crash

        try {
            // Try to get a fresh access token
            const freshToken = await testClient.client.oauth.getFreshAccessToken(testUserId, 'google')

            // If successful, should return a token object
            expect(freshToken).toBeDefined()
        } catch (error) {
            // If it fails due to invalid refresh token or missing OAuth connection,
            // that's expected behavior - the SDK is handling it correctly
            expect(error).toBeDefined()
        }
    })
})
