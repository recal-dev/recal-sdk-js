import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetV1UsersUserIdOauthData,
    GetV1UsersUserIdOauthLinksData,
    GetV1UsersUserIdOauthProviderData,
    GetV1UsersUserIdOauthProviderLinkData,
    GetV1UsersUserIdOauthProviderTokenData,
    PostV1UsersOauthProviderVerifyData,
    PostV1UsersUserIdOauthProviderData,
} from '../client/types.gen'
import { unwrapResponse } from '../utils/response'

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
    async list(userId: string, options?: GetV1UsersUserIdOauthData['query']) {
        const response = await sdk.getV1UsersUserIdOauth({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
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
    async get(userId: string, provider: 'google' | 'microsoft', options?: GetV1UsersUserIdOauthProviderData['query']) {
        const response = await sdk.getV1UsersUserIdOauthProvider({
            path: { userId, provider },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
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
        data: NonNullable<PostV1UsersUserIdOauthProviderData['body']>
    ) {
        const response = await sdk.postV1UsersUserIdOauthProvider({
            path: { userId, provider },
            body: data,
            client: this.client,
        })
        return unwrapResponse(response)
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
        const response = await sdk.deleteV1UsersUserIdOauthProvider({
            path: { userId, provider },
            client: this.client,
        })
        return unwrapResponse(response)
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
    async getAuthLinks(userId: string, options: GetV1UsersUserIdOauthLinksData['query']) {
        const response = await sdk.getV1UsersUserIdOauthLinks({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
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
        options: GetV1UsersUserIdOauthProviderLinkData['query']
    ) {
        const response = await sdk.getV1UsersUserIdOauthProviderLink({
            path: { userId, provider },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
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
        data: NonNullable<PostV1UsersOauthProviderVerifyData['body']>,
        options?: PostV1UsersOauthProviderVerifyData['query']
    ) {
        const response = await sdk.postV1UsersOauthProviderVerify({
            path: { provider },
            body: data,
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get a fresh access token for a user
     *
     * @param userId - The user ID
     * @param provider - The OAuth provider
     *
     * @example
     * ```typescript
     * const token = await recal.oauth.getFreshAccessToken('user-123', 'google')
     * ```
     */
    async getFreshAccessToken(userId: string, provider: 'google' | 'microsoft') {
        const response = await sdk.getV1UsersUserIdOauthProviderToken({
            path: { userId, provider },
            client: this.client,
        })
        return unwrapResponse(response)
    }
}
