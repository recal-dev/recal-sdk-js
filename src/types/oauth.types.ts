import type { Provider } from './calendar.types'

export interface OAuthConnection {
    expiresAt: Date | null
    provider: Provider.GOOGLE | Provider.MICROSOFT
    accessToken?: string
    refreshToken?: string | null
    scope?: string[]
    alive: boolean
}

export interface OAuthLink {
    provider: Provider
    url: string
}
