import { Type as T } from '@sinclair/typebox'
import { OAuthConnectionNotFoundError, ProviderCredentialsNotSetError, UserNotFoundError } from './errors'
import { oauthConnectionSchema, oauthLinkSchema } from './typebox/oauth.tb'
import type { OAuthConnection, OAuthLink, Provider } from './types'
import { FetchError, type FetchHelper } from './utils/fetch.helper'

export class OAuthService {
    private fetchHelper: FetchHelper

    constructor(fetchHelper: FetchHelper) {
        this.fetchHelper = fetchHelper
    }

    /**
     * Get all OAuth connections for a user
     */
    public async getAllConnections(userId: string, redacted = true): Promise<OAuthConnection[]> {
        try {
            const oauthConnections = await this.fetchHelper.fetch(
                `v1/users/${userId}/oauth?redacted=${redacted}`,
                T.Array(oauthConnectionSchema)
            )
            return oauthConnections
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                throw new UserNotFoundError(userId)
            }
            throw error
        }
    }

    /**
     * Get OAuth connection for a specific provider
     */
    public async getConnection(userId: string, provider: Provider, redacted = true): Promise<OAuthConnection> {
        try {
            const oauthConnection = await this.fetchHelper.fetch(
                `v1/users/${userId}/oauth/${provider}?redacted=${redacted}`,
                oauthConnectionSchema
            )
            return oauthConnection
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                // Check the specific error message to determine the type of 404
                if (error.statusText?.includes('OAuth connection not found')) {
                    throw new OAuthConnectionNotFoundError(userId, provider)
                }
                throw new UserNotFoundError(userId)
            }
            throw error
        }
    }

    /**
     * Get OAuth authorization URLs for all providers
     */
    public async getBulkLinks(
        userId: string,
        options?: {
            provider?: Provider | Provider[]
            scope?: 'edit' | 'free-busy'
            accessType?: 'offline' | 'online'
        }
    ): Promise<OAuthLink[]> {
        try {
            const params = new URLSearchParams()
            if (options?.provider) {
                const providers = Array.isArray(options.provider) ? options.provider : [options.provider]
                providers.forEach((p) => params.append('provider', p))
            }
            if (options?.scope) params.append('scope', options.scope)
            if (options?.accessType) params.append('accessType', options.accessType)

            const queryString = params.toString()
            const url = `v1/users/${userId}/oauth/links${queryString ? `?${queryString}` : ''}`

            const oauthLinks = await this.fetchHelper.fetch(url, T.Array(oauthLinkSchema))
            return oauthLinks
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                throw new UserNotFoundError(userId)
            }
            throw error
        }
    }

    /**
     * Get OAuth authorization URL for a specific provider
     */
    public async getLink(
        userId: string,
        provider: Provider,
        options?: {
            scope?: 'edit' | 'free-busy'
            accessType?: 'offline' | 'online'
            redirectUrl?: string
        }
    ): Promise<OAuthLink> {
        try {
            const params = new URLSearchParams()
            if (options?.scope) params.append('scope', options.scope)
            if (options?.accessType) params.append('accessType', options.accessType)
            if (options?.redirectUrl) params.append('redirectUrl', options.redirectUrl)

            const queryString = params.toString()
            const url = `v1/users/${userId}/oauth/${provider}/link${queryString ? `?${queryString}` : ''}`

            const response = await this.fetchHelper.fetch(url, T.Object({ url: T.String() }))
            return { provider, url: response.url }
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                // "OAuth credentials not found" means the server doesn't have credentials for this provider
                if (error.statusText?.includes('OAuth credentials not found')) {
                    throw new ProviderCredentialsNotSetError(provider)
                }
                throw new UserNotFoundError(userId)
            }
            throw error
        }
    }

    /**
     * Set OAuth tokens for a provider
     */
    public async setConnection(
        userId: string,
        provider: Provider,
        connection: {
            accessToken: string
            refreshToken?: string
            scope: string[]
            expiresAt?: Date | string | number
            email?: string
        }
    ): Promise<OAuthConnection> {
        try {
            const oauthConnection = await this.fetchHelper.fetch(
                `v1/users/${userId}/oauth/${provider}`,
                oauthConnectionSchema,
                {
                    method: 'POST',
                    body: JSON.stringify(connection),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            return oauthConnection
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                // POST endpoints typically return "OAuth connection not found" when trying to set a connection
                if (error.statusText?.includes('OAuth connection not found')) {
                    throw new OAuthConnectionNotFoundError(userId, provider)
                }
                throw new UserNotFoundError(userId)
            }
            throw error
        }
    }

    /**
     * Delete OAuth connection for a provider
     */
    public async disconnect(userId: string, provider: Provider): Promise<void> {
        try {
            await this.fetchHelper.fetch(`v1/users/${userId}/oauth/${provider}`, T.Unknown(), {
                method: 'DELETE',
            })
        } catch (error) {
            if (error instanceof FetchError && error.status === 404) {
                if (error.statusText?.includes('OAuth connection not found')) {
                    throw new OAuthConnectionNotFoundError(userId, provider)
                }
                throw new UserNotFoundError(userId)
            }
            throw error
        }
    }

    /**
     * Verify OAuth code (used in OAuth callback flow)
     */
    public async verify(
        provider: Provider,
        code: string,
        state: string,
        redirectUrl?: string
    ): Promise<{ success: boolean }> {
        try {
            const params = new URLSearchParams()
            if (redirectUrl) params.append('redirectUrl', redirectUrl)

            const queryString = params.toString()
            const url = `v1/users/oauth/${provider}/verify${queryString ? `?${queryString}` : ''}`

            const response = await this.fetchHelper.fetch(url, T.Object({ success: T.Boolean() }), {
                method: 'POST',
                body: JSON.stringify({ code, state }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            if (error instanceof FetchError) {
                if (error.status === 404) {
                    // "OAuth authorization provider not found" is a specific message for verify endpoint
                    if (error.statusText?.includes('OAuth authorization provider not found')) {
                        throw new ProviderCredentialsNotSetError(provider)
                    }
                    throw new UserNotFoundError('User not found in state parameter')
                }
                if (error.status === 400) {
                    // "OAuth credentials not configured" is another way the server says credentials aren't set
                    if (error.statusText?.includes('OAuth credentials not configured')) {
                        throw new ProviderCredentialsNotSetError(provider)
                    }
                    throw new Error(error.statusText || 'Invalid OAuth verification request')
                }
            }
            throw error
        }
    }
}
