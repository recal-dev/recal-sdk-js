import { Type } from '@sinclair/typebox'
import { providerSchema } from './calendar.tb'

export const oauthConnectionSchema = Type.Object({
    expiresAt: Type.Union([Type.Date(), Type.Null()]),
    provider: providerSchema,
    accessToken: Type.Optional(Type.String()),
    refreshToken: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    email: Type.Union([Type.String(), Type.Null()]),
    scope: Type.Array(Type.String()),
    alive: Type.Boolean(),
})

export const oauthLinkSchema = Type.Object({
    provider: providerSchema,
    url: Type.String(),
})
