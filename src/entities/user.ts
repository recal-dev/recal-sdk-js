import type { Static } from '@sinclair/typebox'
import { UserNotFoundError } from '@/errors.js'
import { OAuthService } from '@/services/oauth.service.js'
import { OrganizationsService } from '@/services/organizations.service.js'
import type { userSchema } from '@/typebox/user.tb.js'
import type { OAuthConnection } from '@/types/oauth.types.js'
import type { FetchHelper } from '@/utils/fetch.helper.js'
import { Organization } from './organization.js'

export class User {
    private readonly fetchHelper: FetchHelper
    public id: string
    public createdAt: Date
    public organizations?: Organization[]
    public oauthConnections?: OAuthConnection[]

    constructor({
        id,
        createdAt,
        organizations,
        oauthConnections,
        fetchHelper,
    }: {
        id: string
        createdAt: Date
        organizations?: Organization[]
        oauthConnections?: OAuthConnection[]
        fetchHelper: FetchHelper
    }) {
        this.id = id
        this.createdAt = createdAt
        this.organizations = organizations
        this.oauthConnections = oauthConnections
        this.fetchHelper = fetchHelper
    }

    static fromJson(json: Static<typeof userSchema>, fetchHelper: FetchHelper): User {
        return new User({
            ...json,
            organizations: json.organizations?.map((org) => Organization.fromJson(org, fetchHelper)),
            oauthConnections: json.oauthConnections,
            fetchHelper,
        })
    }

    public async getOrganizations(refetch = false): Promise<Organization[]> {
        if (this.organizations === undefined || refetch) {
            const organizationsService = new OrganizationsService(this.fetchHelper)
            const orgs = await organizationsService.listAllFromUser(this.id)
            if (!orgs) throw new UserNotFoundError(this.id)
            this.organizations = orgs
        }
        return this.organizations ?? []
    }

    public async getOAuthConnections(refetch = false): Promise<OAuthConnection[]> {
        if (this.oauthConnections === undefined || refetch) {
            const oauthService = new OAuthService(this.fetchHelper)
            const connections = await oauthService.getAllConnections(this.id)
            this.oauthConnections = connections
        }
        return this.oauthConnections ?? []
    }
}
