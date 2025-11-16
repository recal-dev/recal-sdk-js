import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type { GetUsersUserIdData } from '../client/types.gen'

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
        return sdk.getUsers({ client: this.client })
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
    async get(userId: string, options?: GetUsersUserIdData['query']) {
        return sdk.getUsersUserId({
            path: { userId },
            query: options,
            client: this.client,
        })
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
        return sdk.postUsers({
            body: { id: userId, organizationSlugs },
            client: this.client,
        })
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
        return sdk.putUsersUserId({
            path: { userId },
            body: { userId: newUserId },
            client: this.client,
        })
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
        return sdk.deleteUsersUserId({
            path: { userId },
            client: this.client,
        })
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
        return sdk.getUsersUserIdOrganizations({
            path: { userId },
            client: this.client,
        })
    }
}
