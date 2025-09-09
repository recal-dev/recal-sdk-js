import { Type as T } from '@sinclair/typebox'
import { strippedOrganizationSchema } from './organization.stripped.tb.js'
import { strippedUserSchema } from './user.stripped.tb.js'

export const organizationSchema = T.Object({
    ...strippedOrganizationSchema.properties,
    members: T.Optional(T.Array(strippedUserSchema)),
})
