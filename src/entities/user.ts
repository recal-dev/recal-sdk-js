import type { Static } from '@sinclair/typebox'
import { UserNotFoundError } from 'src/errors'
import { OAuthService } from 'src/services/oauth.service'
import { OrganizationsService } from 'src/services/organizations.service'
import type { userSchema } from 'src/typebox/user.tb'
import type { OAuthConnection } from '../types/oauth.types'
import type { FetchHelper } from '../utils/fetch.helper'
import { Organization } from './organization'

export class User {
    private fetchHelper: FetchHelper
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
