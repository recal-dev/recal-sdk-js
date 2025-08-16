import { Type as T } from '@sinclair/typebox'
import { strippedUserSchema } from './user.tb'

export const strippedOrganizationSchema = T.Object({
    slug: T.String(),
    name: T.Union([T.String(), T.Null()]),
    createdAt: T.Date(),
})

export const organizationSchema = T.Object({
    ...strippedOrganizationSchema.properties,
    members: T.Optional(T.Array(strippedUserSchema)),
})
