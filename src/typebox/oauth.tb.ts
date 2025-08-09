import { Type as T } from '@sinclair/typebox'
import { providerSchema } from './calendar.tb'

export const oauthConnectionSchema = T.Object({
    expiresAt: T.Union([T.Date(), T.Null()]),
    provider: providerSchema,
    accessToken: T.Optional(T.String()),
    refreshToken: T.Optional(T.Union([T.String(), T.Null()])),
    email: T.Union([T.String(), T.Null()]),
    scope: T.Array(T.String()),
    alive: T.Boolean(),
})

export const oauthLinkSchema = T.Object({
    provider: providerSchema,
    url: T.String(),
})
