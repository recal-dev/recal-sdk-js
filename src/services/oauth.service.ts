import { Type as T } from '@sinclair/typebox'
import { OAuthConnectionNotFoundError, ProviderCredentialsNotSetError, UserNotFoundError } from '@/errors.js'
import { oauthConnectionSchema, oauthLinkSchema } from '@/typebox/oauth.tb.js'
import type { Provider } from '@/types/calendar.types.js'
import type { OAuthConnection, OAuthLink } from '@/types/oauth.types.js'
import { errorHandler, type FetchHelper } from '@/utils/fetch.helper.js'

export class OAuthService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * Get all OAuth connections for a user
     * @param userId The ID of the user
     * @param redacted Whether to redact the OAuth connections
     * @returns An array of OAuth connections
     */
    public async getAllConnections(userId: string, redacted = true): Promise<OAuthConnection[]> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/oauth`, {
                schema: T.Array(oauthConnectionSchema),
                searchParams: { redacted },
            })
            .catch(errorHandler([{ code: 404, error: new UserNotFoundError(userId) }]))
    }

    /**
     * Get OAuth connection for a specific provider
     * @param userId The ID of the user
     * @param provider The provider of the OAuth connection
     * @param redacted Whether to redact the OAuth connection
     * @returns The OAuth connection
     */
    public async getConnection(userId: string, provider: Provider, redacted = true): Promise<OAuthConnection> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/oauth/${provider}`, {
                schema: oauthConnectionSchema,
                searchParams: { redacted },
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
        return this.fetchHelper
            .get(`/v1/users/${userId}/oauth/links`, {
                schema: T.Array(oauthLinkSchema),
                searchParams: {
                    provider: options?.provider,
                    scope: options?.scope,
                    accessType: options?.accessType,
                },
            })
            .catch(errorHandler([{ code: 404, error: new UserNotFoundError(userId) }]))
    }

    /**
     * Get OAuth authorization URL for a specific provider
     * @param userId The ID of the user
     * @param provider The provider of the OAuth connection
     * @param options Options for the OAuth authorization URL
     * @returns The OAuth authorization URL
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
        const response = await this.fetchHelper
            .get(`/v1/users/${userId}/oauth/${provider}/link`, {
                schema: T.Object({ url: T.String() }),
                searchParams: {
                    scope: options?.scope,
                    accessType: options?.accessType,
                    redirectUrl: options?.redirectUrl,
                },
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
     * @param userId The ID of the user
     * @param provider The provider of the OAuth connection
     * @param connection The OAuth connection to set
     * @returns The OAuth connection
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
        return this.fetchHelper
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
    }

    /**
     * Delete OAuth connection for a provider
     * @param userId The ID of the user
     * @param provider The provider of the OAuth connection
     * @returns Promise that resolves when the connection is deleted
     */
    public async disconnect(userId: string, provider: Provider): Promise<void> {
        await this.fetchHelper
            .delete(`/v1/users/${userId}/oauth/${provider}`, {
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
     * @param provider The provider of the OAuth connection
     * @param code The OAuth code
     * @param scope The OAuth scope (free-busy or edit)
     * @param state The OAuth state
     * @param redirectUrl The redirect URL
     * @returns The OAuth verification result
     */
    public async verify(
        provider: Provider,
        code: string,
        scope: 'edit' | 'free-busy',
        state: string,
        redirectUrl?: string
    ): Promise<{ success: boolean }> {
        return this.fetchHelper
            .post(`/v1/users/oauth/${provider}/verify`, {
                body: { code, scope, state },
                schema: T.Object({ success: T.Boolean() }),
                searchParams: { redirectUrl },
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
    }
}
