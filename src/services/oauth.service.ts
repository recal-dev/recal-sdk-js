import { Provider } from '../types/calendar.types'
import { OAuthCredentials, OAuthLink } from '../types/oauth.types'

/**
 * Service class for handling OAuth operations
 */
export class OAuthService {
    private organizationSlug: string
    private fetch: (input: string, init?: RequestInit) => Promise<Response>

    /**
     * Creates a new instance of OAuthService
     * @param organizationSlug The organization slug
     * @param fetch Fetch function with authentication
     */
    constructor(organizationSlug: string, fetch: (input: string, init?: RequestInit) => Promise<Response>) {
        this.organizationSlug = organizationSlug
        this.fetch = fetch
    }

    /**
     * Get OAuth URLs for a member
     * @param userId User ID
     * @param filter Filter by provider
     * @param options Additional options
     * @returns List of OAuth URLs
     */
    async getUrls(
        userId: string,
        filter?: Provider[],
        options?: {
            providerRedirectUrlOverwrites?: {
                provider: Provider
                redirectUrl: string
            }[]
        }
    ): Promise<OAuthLink[]> {
        const query = filter ? `?provider=${filter.join(',')}` : ''
        const response = await this.fetch(
            `/organizations/${this.organizationSlug}/members/${userId}/oauth/links${query}`,
            {
                method: 'GET',
                body: options ? JSON.stringify(options) : undefined,
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get OAuth URLs: Status ${response.status} - ${errorText}`)
        }
        return response.json() as Promise<OAuthLink[]>
    }

    /**
     * Get OAuth URL
     * @param userId User ID
     * @param provider Provider
     * @param redirectUrl Optional redirect URL
     * @returns OAuth link
     */
    async getURL(userId: string, provider: Provider, redirectUrl?: string): Promise<OAuthLink> {
        const response = await this.fetch(
            `/organizations/${this.organizationSlug}/members/${userId}/oauth/${provider}/link`,
            {
                method: 'POST',
                body: redirectUrl ? JSON.stringify({ redirectUrl }) : undefined,
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get OAuth URL: Status ${response.status} - ${errorText}`)
        }
        const { url } = (await response.json()) as { url: string }
        return { provider, url } as OAuthLink
    }

    /**
     * Verify OAuth code
     * @param userId User ID
     * @param provider Provider
     * @param code OAuth code
     * @param redirectUrl Optional redirect URL
     */
    async verifyCode(userId: string, provider: Provider, code: string, redirectUrl?: string): Promise<void> {
        const response = await this.fetch(
            `/organizations/${this.organizationSlug}/members/${userId}/oauth/${provider}/verify`,
            {
                method: 'POST',
                body: JSON.stringify({ code, redirectUrl }),
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to verify OAuth code: Status ${response.status} - ${errorText}`)
        }
    }

    /**
     * Verify OAuth response
     * @param userId User ID
     * @param provider Provider
     * @param url Redirect response (the redirect response from the provider to your redirect URL)
     */
    async verifyResponse(userId: string, provider: Provider, url: URL): Promise<void> {
        const { code } = Object.fromEntries(url.searchParams.entries())
        const redirectUrl = url.origin
        const response = await this.fetch(
            `/organizations/${this.organizationSlug}/members/${userId}/oauth/${provider}/verify`,
            {
                method: 'POST',
                body: JSON.stringify({ code, redirectUrl }),
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to verify OAuth response: Status ${response.status} - ${errorText}`)
        }
    }

    /**
     * Set OAuth token
     * @param userId User ID
     * @param provider Provider
     * @param credentials OAuth credentials
     */
    async setToken(userId: string, provider: Provider, credentials: OAuthCredentials): Promise<void> {
        const response = await this.fetch(
            `/organizations/${this.organizationSlug}/members/${userId}/oauth/${provider}`,
            {
                method: 'POST',
                body: JSON.stringify(credentials),
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to set OAuth token: Status ${response.status} - ${errorText}`)
        }
    }

    /**
     * Remove OAuth connection
     * @param userId User ID
     * @param provider Provider
     */
    async removeConnection(userId: string, provider: Provider): Promise<void> {
        const response = await this.fetch(
            `/organizations/${this.organizationSlug}/members/${userId}/oauth/${provider}`,
            {
                method: 'DELETE',
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to remove OAuth connection: Status ${response.status} - ${errorText}`)
        }
    }
}
