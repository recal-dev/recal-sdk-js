import type { Static } from '@sinclair/typebox'
import type { organizationSchema } from 'src/typebox/organization.tb'
import { User } from './user'

export class Organization {
    public slug: string
    public name: string | null
    public createdAt: Date
    public members?: User[]

    constructor({
        slug,
        name,
        createdAt,
        members,
    }: {
        slug: string
        name: string | null
        createdAt: Date
        members?: User[]
    }) {
        this.slug = slug
        this.name = name
        this.createdAt = createdAt
        this.members = members
    }

    static fromJson(json: Static<typeof organizationSchema>): Organization {
        return new Organization({ ...json, members: json.members?.map((member) => User.fromJson(member)) })
    }

    public getMembers(): User[] {
        return []
    }
}
