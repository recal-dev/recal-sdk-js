import { Type as T } from '@sinclair/typebox'
import { oauthConnectionSchema } from './oauth.tb'
import { strippedOrganizationSchema } from './organization.tb'

export const strippedUserSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
})

export const userSchema = T.Object({
    ...strippedUserSchema.properties,
    organizations: T.Optional(T.Array(strippedOrganizationSchema)),
    oauthConnections: T.Optional(T.Array(oauthConnectionSchema)),
})
