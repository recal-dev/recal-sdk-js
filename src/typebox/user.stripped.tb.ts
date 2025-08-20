import { Type as T } from '@sinclair/typebox'

export const strippedUserSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
})
