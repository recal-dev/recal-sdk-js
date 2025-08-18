import { Type as T } from '@sinclair/typebox'
import { OAuthConnectionNotFoundError, ProviderCredentialsNotSetError, UserNotFoundError } from '../errors'
import { oauthConnectionSchema, oauthLinkSchema } from '../typebox/oauth.tb'
import type { Provider } from '../types/calendar.types'
import type { OAuthConnection, OAuthLink } from '../types/oauth.types'
import { errorHandler, type FetchHelper } from '../utils/fetch.helper'

export class OAuthService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * Get all OAuth connections for a user
     * @param userId The ID of the user
     * @param redacted Whether to redact the OAuth connections
     * @returns An array of OAuth connections
     */
    public async getAllConnections(userId: string, redacted = true): Promise<OAuthConnection[]> {
        const oauthConnections = await this.fetchHelper
            .get(`/v1/users/${userId}/oauth?redacted=${redacted}`, {
                schema: T.Array(oauthConnectionSchema),
            })
            .catch(errorHandler([{ code: 404, error: new UserNotFoundError(userId) }]))
        return oauthConnections
    }

    /**
     * Get OAuth connection for a specific provider
     * @param userId The ID of the user
     * @param provider The provider of the OAuth connection
     * @param redacted Whether to redact the OAuth connection
     * @returns The OAuth connection
     */
    public async getConnection(userId: string, provider: Provider, redacted = true): Promise<OAuthConnection> {
        const oauthConnection = await this.fetchHelper
            .get(`/v1/users/${userId}/oauth/${provider}?redacted=${redacted}`, {
                schema: oauthConnectionSchema,
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        statusTextInclFilter: 'OAuth connection not found',
                        error: new OAuthConnectionNotFoundError(userId, provider),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
        return oauthConnection
    }

    /**
     * Get OAuth authorization URLs for all providers
     * @param userId The ID of the user
     * @param options Options for the OAuth authorization URLs
     * @returns An array of OAuth authorization URLs
     */
    public async getBulkLinks(
        userId: string,
        options?: {
            provider?: Provider | Provider[]
            scope?: 'edit' | 'free-busy'
            accessType?: 'offline' | 'online'
        }
    ): Promise<OAuthLink[]> {
        const params = new URLSearchParams()
        if (options?.provider) {
            const providers = Array.isArray(options.provider) ? options.provider : [options.provider]
            providers.forEach((p) => params.append('provider', p))
        }
        if (options?.scope) params.append('scope', options.scope)
        if (options?.accessType) params.append('accessType', options.accessType)

        const queryString = params.toString()
        const url = `/v1/users/${userId}/oauth/links${queryString ? `?${queryString}` : ''}`

        const oauthLinks = await this.fetchHelper
            .get(url, {
                schema: T.Array(oauthLinkSchema),
            })
            .catch(errorHandler([{ code: 404, error: new UserNotFoundError(userId) }]))
        return oauthLinks
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
        const params = new URLSearchParams()
        if (options?.scope) params.append('scope', options.scope)
        if (options?.accessType) params.append('accessType', options.accessType)
        if (options?.redirectUrl) params.append('redirectUrl', options.redirectUrl)

        const queryString = params.toString()
        const url = `/v1/users/${userId}/oauth/${provider}/link${queryString ? `?${queryString}` : ''}`

        const response = await this.fetchHelper
            .get(url, {
                schema: T.Object({ url: T.String() }),
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        statusTextInclFilter: 'OAuth credentials not found',
                        error: new ProviderCredentialsNotSetError(provider),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
        return { provider, url: response.url }
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
        const oauthConnection = await this.fetchHelper
            .post(`/v1/users/${userId}/oauth/${provider}`, {
                schema: oauthConnectionSchema,
                body: connection,
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        statusTextInclFilter: 'OAuth connection not found',
                        error: new OAuthConnectionNotFoundError(userId, provider),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
        return oauthConnection
    }

    /**
     * Delete OAuth connection for a provider
     */
    public async disconnect(userId: string, provider: Provider): Promise<void> {
        await this.fetchHelper
            .delete(`v1/users/${userId}/oauth/${provider}`, {
                schema: T.Object({ success: T.Boolean() }),
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        statusTextInclFilter: 'OAuth connection not found',
                        error: new OAuthConnectionNotFoundError(userId, provider),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
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
        const params = new URLSearchParams()
        if (redirectUrl) params.append('redirectUrl', redirectUrl)

        const queryString = params.toString()
        const url = `/v1/users/oauth/${provider}/verify${queryString ? `?${queryString}` : ''}`

        const response = await this.fetchHelper
            .post(url, {
                schema: T.Object({ success: T.Boolean() }),
                body: { code, state },
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        statusTextInclFilter: 'OAuth authorization provider not found',
                        error: new ProviderCredentialsNotSetError(provider),
                    },
                    { code: 404, error: new UserNotFoundError('User not found in state parameter') },
                    {
                        code: 400,
                        statusTextInclFilter: 'OAuth credentials not configured',
                        error: new ProviderCredentialsNotSetError(provider),
                    },
                    {
                        code: 400,
                        error: new Error('Invalid OAuth verification request'),
                    },
                ])
            )
        return response
    }
}
