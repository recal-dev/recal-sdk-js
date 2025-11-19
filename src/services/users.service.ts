import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type { GetV1UsersUserIdData } from '../client/types.gen'
import { unwrapResponse } from '../utils/response'

/**
 * Users Service
 *
 * Provides methods for managing users
 */
export class UsersService {
    constructor(private client: Client) {}

    /**
     * List all users
     *
     * @example
     * ```typescript
     * const users = await recal.users.list()
     * ```
     */
    async list() {
        const response = await sdk.getV1Users({ client: this.client })
        return unwrapResponse(response)
    }

    /**
     * Get a user by ID
     *
     * @param userId - The user ID
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const user = await recal.users.get('user-123', {
     *   include: ['organizations', 'oauthConnections']
     * })
     * ```
     */
    async get(userId: string, options?: GetV1UsersUserIdData['query']) {
        const response = await sdk.getV1UsersUserId({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Create a new user
     *
     * @param userId - The user ID
     * @param organizationSlugs - Optional organization slugs to add user to
     *
     * @example
     * ```typescript
     * const user = await recal.users.create('user-123', ['org-1'])
     * ```
     */
    async create(userId: string, organizationSlugs?: string[]) {
        const response = await sdk.postV1Users({
            body: { id: userId, organizationSlugs },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Update a user
     *
     * @param userId - The current user ID
     * @param newUserId - The new user ID
     *
     * @example
     * ```typescript
     * const user = await recal.users.update('user-123', 'user-456')
     * ```
     */
    async update(userId: string, newUserId: string) {
        const response = await sdk.putV1UsersUserId({
            path: { userId },
            body: { userId: newUserId },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Delete a user
     *
     * @param userId - The user ID
     *
     * @example
     * ```typescript
     * await recal.users.delete('user-123')
     * ```
     */
    async delete(userId: string) {
        const response = await sdk.deleteV1UsersUserId({
            path: { userId },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get all organizations a user is connected to
     *
     * @param userId - The user ID
     *
     * @example
     * ```typescript
     * const orgs = await recal.users.getOrganizations('user-123')
     * ```
     */
    async getOrganizations(userId: string) {
        const response = await sdk.getV1UsersUserIdOrganizations({
            path: { userId },
            client: this.client,
        })
        return unwrapResponse(response)
    }
}
