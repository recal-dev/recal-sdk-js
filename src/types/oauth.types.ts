import { Provider } from './calendar.types'

export type OAuthLink = {
    provider: Provider
    url: string
}

export type OAuthCredentials = {
    accessToken: string
    refreshToken?: string
    expiresAt?: Date | number
    scope?: string[]
}
