import type { Static } from '@sinclair/typebox'
import type { userSchema } from 'src/typebox/user.tb'
import type { Event } from '../types/calendar.types'
import type { OAuthConnection } from '../types/oauth.types'
import { Organization } from './organization'

export class User {
    public id: string
    public createdAt: Date
    public organizations?: Organization[]
    public oauthConnections?: OAuthConnection[]

    constructor({
        id,
        createdAt,
        organizations,
        oauthConnections,
    }: {
        id: string
        createdAt: Date
        organizations?: Organization[]
        oauthConnections?: OAuthConnection[]
    }) {
        this.id = id
        this.createdAt = createdAt
        this.organizations = organizations
        this.oauthConnections = oauthConnections
    }

    static fromJson(json: Static<typeof userSchema>): User {
        return new User({ ...json, organizations: json.organizations?.map((org) => Organization.fromJson(org)) })
    }

    public getOrganizations(): Organization[] {
        return []
    }

    public getOAuthConnections(): OAuthConnection[] {
        return []
    }

    public getEvents(): Event[] {
        return []
    }
}
