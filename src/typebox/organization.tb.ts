import { Type as T } from '@sinclair/typebox'
import { strippedOrganizationSchema } from './organization.stripped.tb'
import { strippedUserSchema } from './user.stripped.tb'

export const organizationSchema = T.Object({
    ...strippedOrganizationSchema.properties,
    members: T.Optional(T.Array(strippedUserSchema)),
})
