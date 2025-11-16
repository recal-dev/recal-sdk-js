import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetOrganizationsOrgSlugCalendarBusyData,
    GetOrganizationsOrgSlugMembersData,
    GetOrganizationsOrgSlugSchedulingData,
} from '../client/types.gen'

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
        return sdk.getOrganizations({ client: this.client })
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
        return sdk.getOrganizationsOrgSlug({
            path: { orgSlug: slug },
            client: this.client,
        })
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
        return sdk.postOrganizations({
            body: { slug, name },
            client: this.client,
        })
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
        return sdk.putOrganizationsOrgSlug({
            path: { orgSlug: slug },
            body: data,
            client: this.client,
        })
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
        return sdk.deleteOrganizationsOrgSlug({
            path: { orgSlug: slug },
            client: this.client,
        })
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
    async getMembers(slug: string, options?: GetOrganizationsOrgSlugMembersData['query']) {
        return sdk.getOrganizationsOrgSlugMembers({
            path: { orgSlug: slug },
            query: options,
            client: this.client,
        })
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
        return sdk.postOrganizationsOrgSlugMembers({
            path: { orgSlug: slug },
            body: { userIds },
            client: this.client,
        })
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
        return sdk.deleteOrganizationsOrgSlugMembers({
            path: { orgSlug: slug },
            body: { userIds },
            client: this.client,
        })
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
    async getBusyTimes(slug: string, options: GetOrganizationsOrgSlugCalendarBusyData['query']) {
        return sdk.getOrganizationsOrgSlugCalendarBusy({
            path: { orgSlug: slug },
            query: options,
            client: this.client,
        })
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
    async getScheduling(slug: string, options: GetOrganizationsOrgSlugSchedulingData['query']) {
        return sdk.getOrganizationsOrgSlugScheduling({
            path: { orgSlug: slug },
            query: options,
            client: this.client,
        })
    }
}
