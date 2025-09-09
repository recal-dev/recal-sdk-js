import { Type as T } from '@sinclair/typebox'
import { User } from '@/entities/user'
import { userSchema } from '@/typebox/user.tb'
import { Organization } from '../entities/organization'
import { OrganizationAlreadyExistsError, OrganizationNotFoundError } from '../errors'
import { organizationSchema } from '../typebox/organization.tb'
import { errorHandler, type FetchHelper } from '../utils/fetch.helper'

export class OrganizationsService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * List all organizations
     * @returns An array of organizations
     */
    public async listAll(): Promise<Organization[]> {
        return this.fetchHelper
            .get('/v1/organizations', {
                schema: T.Array(organizationSchema),
            })
            .then((organizations) => organizations.map((org) => Organization.fromJson(org, this.fetchHelper)))
    }

    public async listAllFromUser(userId: string): Promise<Organization[] | null> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/organizations`, {
                schema: T.Array(organizationSchema),
            })
            .catch(errorHandler([{ code: 404, result: null }]))
            .then((orgs) => (orgs ? orgs.map((org) => Organization.fromJson(org, this.fetchHelper)) : null))
    }

    /**
     * Get an organization by slug
     * @param slug The slug of the organization
     * @returns The organization
     */
    public async get(slug: string): Promise<Organization> {
        return this.fetchHelper
            .get(`/v1/organizations/${slug}`, {
                schema: organizationSchema,
            })
            .catch(errorHandler([{ code: 404, error: new OrganizationNotFoundError(slug) }]))
            .then((org) => Organization.fromJson(org, this.fetchHelper))
    }

    /**
     * Create an organization
     * @param slug The slug of the organization
     * @param name The name of the organization
     * @returns The created organization
     */
    public async create(slug: string, name: string): Promise<Organization> {
        return this.fetchHelper
            .post(`/v1/organizations`, {
                body: { slug, name },
                schema: organizationSchema,
            })
            .catch(errorHandler([{ code: 409, error: new OrganizationAlreadyExistsError(slug) }]))
            .then((org) => Organization.fromJson(org, this.fetchHelper))
    }

    /**
     * Update an organization
     * @param slug The slug of the organization
     * @param updatedOrganizationData The updated organization data
     * @returns The updated organization
     */
    public async update(slug: string, updatedOrganizationData: { slug: string; name: string }): Promise<Organization> {
        return this.fetchHelper
            .put(`/v1/organizations/${slug}`, {
                body: updatedOrganizationData,
                schema: organizationSchema,
            })
            .catch(
                errorHandler([
                    { code: 404, error: new OrganizationNotFoundError(slug) },
                    { code: 409, error: new OrganizationAlreadyExistsError(slug) },
                ])
            )
            .then((org) => Organization.fromJson(org, this.fetchHelper))
    }

    /**
     * Delete an organization
     * @param slug The slug of the organization
     * @returns The deleted organization
     */
    public async delete(slug: string): Promise<Organization> {
        return this.fetchHelper
            .delete(`/v1/organizations/${slug}`, {
                schema: organizationSchema,
            })
            .catch(errorHandler([{ code: 404, error: new OrganizationNotFoundError(slug) }]))
            .then((org) => Organization.fromJson(org, this.fetchHelper))
    }

    /**
     * Get the members of an organization
     * @param slug The slug of the organization
     * @returns The members of the organization
     */
    public async getMembers(slug: string): Promise<User[]> {
        return this.fetchHelper
            .get(`/v1/organizations/${slug}/members`, {
                schema: T.Array(userSchema),
            })
            .catch(errorHandler([{ code: 404, error: new OrganizationNotFoundError(slug) }]))
            .then((users) => users.map((user) => User.fromJson(user, this.fetchHelper)))
    }

    /**
     * Add members to an organization
     * @param slug The slug of the organization
     * @param userIds The IDs of the users to add
     * @returns The added users
     */
    public async addMembers(slug: string, userIds: string[]) {
        return this.fetchHelper
            .post(`/v1/organizations/${slug}/members`, {
                body: { userIds },
            })
            .catch(errorHandler([{ code: 404, error: new OrganizationNotFoundError(slug) }]))
    }

    /**
     * Remove members from an organization
     * @param slug The slug of the organization
     * @param userIds The IDs of the users to remove
     * @returns Success message
     */
    public async removeMembers(slug: string, userIds: string[]): Promise<string> {
        return this.fetchHelper
            .delete(`/v1/organizations/${slug}/members`, {
                body: { userIds },
                schema: T.String(),
            })
            .catch(errorHandler([{ code: 404, error: new OrganizationNotFoundError(slug) }]))
    }
}
