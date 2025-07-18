import type { OAuthConnection } from './oauth.types'

export interface User {
    id: string
    createdAt: Date
    organizations?: Organization[]
    oauthConnections?: OAuthConnection[]
}

export interface Organization {
    name: string | null
    createdAt: Date
    slug: string
    members?: User[]
}
