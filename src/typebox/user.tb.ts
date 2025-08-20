import { Type as T } from '@sinclair/typebox'
import { oauthConnectionSchema } from './oauth.tb'
import { strippedOrganizationSchema } from './organization.stripped.tb'
import { strippedUserSchema } from './user.stripped.tb'

export const userSchema = T.Object({
    ...strippedUserSchema.properties,
    organizations: T.Optional(T.Array(strippedOrganizationSchema)),
    oauthConnections: T.Optional(T.Array(oauthConnectionSchema)),
})
