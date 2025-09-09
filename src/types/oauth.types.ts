import type { Provider } from './calendar.types.js'

export interface OAuthConnection {
    expiresAt: Date | null
    provider: Provider
    accessToken?: string
    refreshToken?: string | null
    email: string | null
    scope: string[]
    alive: boolean
}

export interface OAuthLink {
    provider: Provider
    url: string
}
