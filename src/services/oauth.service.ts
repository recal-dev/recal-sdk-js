import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetUsersUserIdOauthData,
    GetUsersUserIdOauthLinksData,
    GetUsersUserIdOauthProviderData,
    GetUsersUserIdOauthProviderLinkData,
    GetUsersUserIdOauthProviderTokenData,
    PostUsersOauthProviderVerifyData,
    PostUsersUserIdOauthProviderData,
} from '../client/types.gen'

/**
 * OAuth Service
 *
 * Provides methods for managing OAuth connections
 */
export class OAuthService {
    constructor(private client: Client) {}

    /**
     * Get all OAuth connections for a user
     *
     * @param userId - The user ID
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const connections = await recal.oauth.list('user-123', {
     *   showToken: 'true'
     * })
     * ```
     */
    async list(userId: string, options?: GetUsersUserIdOauthData['query']) {
        return sdk.getUsersUserIdOauth({
            path: { userId },
            query: options,
            client: this.client,
        })
    }

    /**
     * Get a specific OAuth connection
     *
     * @param userId - The user ID
     * @param provider - The OAuth provider
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const connection = await recal.oauth.get('user-123', 'google')
     * ```
     */
    async get(userId: string, provider: 'google' | 'microsoft', options?: GetUsersUserIdOauthProviderData['query']) {
        return sdk.getUsersUserIdOauthProvider({
            path: { userId, provider },
            query: options,
            client: this.client,
        })
    }

    /**
     * Create a new OAuth connection
     *
     * @param userId - The user ID
     * @param provider - The OAuth provider
     * @param data - OAuth connection data
     *
     * @example
     * ```typescript
     * const connection = await recal.oauth.create('user-123', 'google', {
     *   accessToken: 'token',
     *   refreshToken: 'refresh',
     *   email: 'user@gmail.com',
     *   expiresAt: '2024-12-31T23:59:59Z',
     *   scope: ['calendar.readonly']
     * })
     * ```
     */
    async create(
        userId: string,
        provider: 'google' | 'microsoft',
        data: NonNullable<PostUsersUserIdOauthProviderData['body']>
    ) {
        return sdk.postUsersUserIdOauthProvider({
            path: { userId, provider },
            body: data,
            client: this.client,
        })
    }

    /**
     * Delete an OAuth connection
     *
     * @param userId - The user ID
     * @param provider - The OAuth provider
     *
     * @example
     * ```typescript
     * await recal.oauth.delete('user-123', 'google')
     * ```
     */
    async delete(userId: string, provider: 'google' | 'microsoft') {
        return sdk.deleteUsersUserIdOauthProvider({
            path: { userId, provider },
            client: this.client,
        })
    }

    /**
     * Get OAuth authorization URLs for all providers
     *
     * @param userId - The user ID
     * @param options - OAuth options
     *
     * @example
     * ```typescript
     * const links = await recal.oauth.getAuthLinks('user-123', {
     *   provider: 'google',
     *   accessType: 'offline',
     *   scope: 'edit'
     * })
     * ```
     */
    async getAuthLinks(userId: string, options: GetUsersUserIdOauthLinksData['query']) {
        return sdk.getUsersUserIdOauthLinks({
            path: { userId, provider: options.provider },
            query: options,
            client: this.client,
        })
    }

    /**
     * Get OAuth authorization URL for a specific provider
     *
     * @param userId - The user ID
     * @param provider - The OAuth provider
     * @param options - OAuth options
     *
     * @example
     * ```typescript
     * const link = await recal.oauth.getAuthLink('user-123', 'google', {
     *   provider: 'google',
     *   accessType: 'offline',
     *   scope: 'edit',
     *   redirectUrl: 'https://app.com/callback'
     * })
     * ```
     */
    async getAuthLink(
        userId: string,
        provider: 'google' | 'microsoft',
        options: GetUsersUserIdOauthProviderLinkData['query']
    ) {
        return sdk.getUsersUserIdOauthProviderLink({
            path: { userId, provider },
            query: options,
            client: this.client,
        })
    }

    /**
     * Verify an OAuth authorization code
     *
     * @param provider - The OAuth provider
     * @param data - Verification data
     * @param options - Query options
     *
     * @example
     * ```typescript
     * await recal.oauth.verifyCode('google', {
     *   code: 'auth-code',
     *   state: 'state-token',
     *   scope: ['calendar.edit']
     * }, {
     *   redirectUrl: 'https://app.com/callback'
     * })
     * ```
     */
    async verifyCode(
        provider: 'google' | 'microsoft',
        data: NonNullable<PostUsersOauthProviderVerifyData['body']>,
        options?: PostUsersOauthProviderVerifyData['query']
    ) {
        return sdk.postUsersOauthProviderVerify({
            path: { provider },
            body: data,
            query: options,
            client: this.client,
        })
    }

    /**
     * Get a fresh access token for a user
     *
     * @param userId - The user ID
     * @param provider - The OAuth provider
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const token = await recal.oauth.getFreshToken('user-123', 'google', {
     *   redirectUrl: 'https://app.com/callback'
     * })
     * ```
     */
    async getFreshToken(
        userId: string,
        provider: 'google' | 'microsoft',
        options: GetUsersUserIdOauthProviderTokenData['query']
    ) {
        return sdk.getUsersUserIdOauthProviderToken({
            path: { userId, provider },
            query: options,
            client: this.client,
        })
    }
}
