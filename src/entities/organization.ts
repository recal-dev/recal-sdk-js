import type { Static } from '@sinclair/typebox'
import { OrganizationsService } from 'src/services/organizations.service'
import type { organizationSchema } from 'src/typebox/organization.tb'
import type { FetchHelper } from '../utils/fetch.helper'
import { User } from './user'

export class Organization {
    private fetchHelper: FetchHelper
    public slug: string
    public name: string | null
    public createdAt: Date
    public members?: User[]

    constructor({
        slug,
        name,
        createdAt,
        members,
        fetchHelper,
    }: {
        slug: string
        name: string | null
        createdAt: Date
        members?: User[]
        fetchHelper: FetchHelper
    }) {
        this.slug = slug
        this.name = name
        this.createdAt = createdAt
        this.members = members
        this.fetchHelper = fetchHelper
    }

    static fromJson(json: Static<typeof organizationSchema>, fetchHelper: FetchHelper): Organization {
        return new Organization({
            ...json,
            members: json.members?.map((member) => User.fromJson(member, fetchHelper)),
            fetchHelper,
        })
    }

    public async getMembers(refetch = false): Promise<User[]> {
        if (refetch) {
            const organizationsService = new OrganizationsService(this.fetchHelper)
            const newData = await organizationsService.getMembers(this.slug)
            this.members = newData
        }
        return this.members ?? []
    }
}
