import { Type as T } from '@sinclair/typebox'

export const strippedUserSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
})

export const strippedOrganizationSchema = T.Object({
    slug: T.String(),
    name: T.Union([T.String(), T.Null()]),
    createdAt: T.Date(),
})
