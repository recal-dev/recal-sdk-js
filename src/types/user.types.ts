import type { Static } from '@sinclair/typebox'
import type { userSchema } from '../typebox/user.tb.js'

export type UserJson = Static<typeof userSchema>

export interface CreateUser {
    id: string
    organizationSlugs?: string[]
}

export interface UpdateUser {
    id: string
}
