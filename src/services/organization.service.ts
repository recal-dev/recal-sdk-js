import { Type as T } from '@sinclair/typebox'
import { Organization } from '../entities/organization'
import { OrganizationAlreadyExistsError, OrganizationNotFoundError } from '../errors'
import { organizationSchema } from '../typebox/organization.tb'
import { errorHandler, type FetchHelper } from '../utils/fetch.helper'

export class OrganizationService {
    constructor(private fetchHelper: FetchHelper) {}

    public async listAll(): Promise<Organization[]> {
        /**
         * List all organizations
         * @returns An array of organizations
         */
        return this.fetchHelper
            .get('/v1/organizations', {
                schema: T.Array(organizationSchema),
            })
            .then((organizations) => organizations.map(Organization.fromJson))
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
            .then(Organization.fromJson)
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
            .then(Organization.fromJson)
    }

    /**
     * Update an organization
     * @param slug The slug of the organization
     * @param updatedOrganizationData The updated organization data
     * @returns The updated organization
     */
    public async update(
        slug: string,
        updatedOrganizationData: { slug?: string; name?: string }
    ): Promise<Organization> {
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
            .then(Organization.fromJson)
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
            .then(Organization.fromJson)
    }
}
