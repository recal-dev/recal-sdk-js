import type { Static } from '@sinclair/typebox'
import type { organizationSchema } from '../typebox/organization.tb.js'

export type OrganizationJson = Static<typeof organizationSchema>

export interface CreateOrganization {
    slug: string
    name: string
}

export interface UpdateOrganization {
    slug: string
    name: string
}

export interface AddOrganizationMembers {
    userIds: string[]
}

export interface RemoveOrganizationMembers {
    userIds: string[]
}
