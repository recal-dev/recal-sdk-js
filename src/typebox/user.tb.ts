import { Type as T } from '@sinclair/typebox'
import { oauthConnectionSchema } from './oauth.tb.js'
import { strippedOrganizationSchema } from './organization.stripped.tb.js'
import { strippedUserSchema } from './user.stripped.tb.js'

export const userSchema = T.Object({
    ...strippedUserSchema.properties,
    organizations: T.Optional(T.Array(strippedOrganizationSchema)),
    oauthConnections: T.Optional(T.Array(oauthConnectionSchema)),
})
