import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetV1OrganizationsOrgSlugCalendarBusyData,
    GetV1OrganizationsOrgSlugMembersData,
    GetV1OrganizationsOrgSlugSchedulingData,
} from '../client/types.gen'
import { unwrapResponse } from '../utils/response'

/**
 * Organizations Service
 *
 * Provides methods for managing organizations
 */
export class OrganizationsService {
    constructor(private client: Client) {}

    /**
     * List all organizations
     *
     * @example
     * ```typescript
     * const orgs = await recal.organizations.list()
     * ```
     */
    async list() {
        const response = await sdk.getV1Organizations({ client: this.client })
        return unwrapResponse(response)
    }

    /**
     * Get an organization by slug
     *
     * @param slug - The organization slug
     *
     * @example
     * ```typescript
     * const org = await recal.organizations.get('acme-corp')
     * ```
     */
    async get(slug: string) {
        const response = await sdk.getV1OrganizationsOrgSlug({
            path: { orgSlug: slug },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Create a new organization
     *
     * @param slug - The organization slug
     * @param name - The organization name
     *
     * @example
     * ```typescript
     * const org = await recal.organizations.create('acme-corp', 'Acme Corporation')
     * ```
     */
    async create(slug: string, name: string | null) {
        const response = await sdk.postV1Organizations({
            body: { slug, name },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Update an organization
     *
     * @param slug - The organization slug
     * @param data - Updated organization data
     *
     * @example
     * ```typescript
     * const org = await recal.organizations.update('acme-corp', {
     *   slug: 'acme-corp',
     *   name: 'Acme Corp (Updated)'
     * })
     * ```
     */
    async update(slug: string, data: { slug: string; name: string | null }) {
        const response = await sdk.putV1OrganizationsOrgSlug({
            path: { orgSlug: slug },
            body: data,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Delete an organization
     *
     * @param slug - The organization slug
     *
     * @example
     * ```typescript
     * await recal.organizations.delete('acme-corp')
     * ```
     */
    async delete(slug: string) {
        const response = await sdk.deleteV1OrganizationsOrgSlug({
            path: { orgSlug: slug },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get all members of an organization
     *
     * @param slug - The organization slug
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const members = await recal.organizations.getMembers('acme-corp', {
     *   include: ['oauthConnections']
     * })
     * ```
     */
    async getMembers(slug: string, options?: GetV1OrganizationsOrgSlugMembersData['query']) {
        const response = await sdk.getV1OrganizationsOrgSlugMembers({
            path: { orgSlug: slug },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Add members to an organization
     *
     * @param slug - The organization slug
     * @param userIds - Array of user IDs to add
     *
     * @example
     * ```typescript
     * await recal.organizations.addMembers('acme-corp', ['user-1', 'user-2'])
     * ```
     */
    async addMembers(slug: string, userIds: string[]) {
        const response = await sdk.postV1OrganizationsOrgSlugMembers({
            path: { orgSlug: slug },
            body: { userIds },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Remove members from an organization
     *
     * @param slug - The organization slug
     * @param userIds - Array of user IDs to remove
     *
     * @example
     * ```typescript
     * await recal.organizations.removeMembers('acme-corp', ['user-1'])
     * ```
     */
    async removeMembers(slug: string, userIds: string[]) {
        const response = await sdk.deleteV1OrganizationsOrgSlugMembers({
            path: { orgSlug: slug },
            body: { userIds },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get consolidated busy times for all users in an organization
     *
     * @param slug - The organization slug
     * @param options - Query options with time range
     *
     * @example
     * ```typescript
     * const busy = await recal.organizations.getBusyTimes('acme-corp', {
     *   start: '2024-01-01T00:00:00Z',
     *   end: '2024-01-31T23:59:59Z',
     *   provider: 'google'
     * })
     * ```
     */
    async getBusyTimes(slug: string, options: GetV1OrganizationsOrgSlugCalendarBusyData['query']) {
        const response = await sdk.getV1OrganizationsOrgSlugCalendarBusy({
            path: { orgSlug: slug },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get available time slots for all users in an organization
     *
     * @param slug - The organization slug
     * @param options - Scheduling options
     *
     * @example
     * ```typescript
     * const slots = await recal.organizations.getScheduling('acme-corp', {
     *   start: '2024-01-15T00:00:00Z',
     *   end: '2024-01-19T23:59:59Z',
     *   slotDuration: '30',
     *   padding: '15'
     * })
     * ```
     */
    async getScheduling(slug: string, options: GetV1OrganizationsOrgSlugSchedulingData['query']) {
        const response = await sdk.getV1OrganizationsOrgSlugScheduling({
            path: { orgSlug: slug },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }
}
