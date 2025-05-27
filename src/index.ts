import { FreeBusy, Provider, RecalOptions, TimeRange } from './types'
import type { Organization, OrganizationMember } from './types/entity.types'
import { OAuthCredentials, OAuthLink } from './types/oauth.types'

/**
 * Recal SDK
 * @description Recal SDK for Node.js
 * @version 0.1.0
 * @author Recal <team@recal.dev>
 * @license MIT
 */
export class Recal {
    // MARK: States
    private token: string
    private baseURL: string

    /**
     * Recal SDK constructor
     * @param token Recal API token
     */
    constructor(options?: RecalOptions) {
        let envToken: string
        if (!options?.token) {
            const _envToken = process.env.RECAL_TOKEN
            if (!_envToken)
                throw new Error('[Recal] No token provided by constructor or environment variable (RECAL_TOKEN)')
            envToken = _envToken
        }
        this.token = options?.token || envToken!
        this.baseURL = options?.baseURL || process.env.RECAL_BASE_URL || 'https://api.recal.dev'
    }

    // MARK: Functions
    /**
     * Fetch function with Recal authentication
     * @param input Request input
     * @param init Request init
     * @returns Promise<Response>
     */
    _fetch = async (input: string, init?: RequestInit): Promise<Response> => {
        const url = new URL(`${this.baseURL}/v1${input.startsWith('/') ? '' : '/'}${input}`)
        return await fetch(url, {
            method: init?.method || 'GET',
            headers: {
                ...init?.headers,
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            mode: 'cors',
            ...init,
        }).catch((error) => {
            throw new Error(`[Recal] Fetch error: ${error}`)
        })
    }

    private fetch = (input: string, init?: RequestInit): Promise<Response> => {
        return this._fetch(input, init)
    }

    // Organization
    /**
     * Organization namespace
     */
    organizations = {
        /**
         * Get all organizations
         * @returns Promise<PublicOrganization[]>
         */
        list: async (): Promise<Organization[]> => {
            const response = await this.fetch('/organizations')
            if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            return response.json() as Promise<Organization[]>
        },

        /**
         * Get organization by slug
         * @param slug Organization slug
         * @returns Promise<Organization>
         */
        get: async (slug: string): Promise<Organization> => {
            const response = await this.fetch(`/organizations/${slug}`)
            if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            return response.json() as Promise<Organization>
        },

        /**
         * Organization wide calendar namespace
         */
        calendar: {
            /**
             * Get free busy time ranges for all organization members
             * @param organizationSlug Organization slug
             * @param timeRange Time range
             * @param primaryOnly Only primary calendars of members (default: false)
             * @param provider Providers (default: undefined => all)
             * @returns Promise<TimeRange[]>
             */
            freeBusy: async (
                organizationSlug: string,
                timeRange: TimeRange,
                primaryOnly?: boolean,
                provider?: Provider[]
            ): Promise<TimeRange[]> => {
                const providerQuery = provider ? `&provider=${provider.join(',')}` : ''
                const query = `?timeMin=${timeRange.start.toISOString()}&timeMax=${timeRange.end.toISOString()}${providerQuery}${
                    primaryOnly ? '&primaryOnly=true' : ''
                }`
                const response = await this.fetch(`/organizations/${organizationSlug}/calendar/freeBusy${query}`)
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
                return response.json() as Promise<TimeRange[]>
            },
        },
    }

    // Member
    /**
     * Member namespace
     */
    members = (organizationSlug: string) => ({
        /**
         * List members of an organization
         * @returns Promise<OrganizationMember[]>
         */
        list: async (): Promise<OrganizationMember[]> => {
            const response = await this.fetch(`/organizations/${organizationSlug}/members`)
            if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            return response.json() as Promise<OrganizationMember[]>
        },

        /**
         * Get member of an organization
         * @param userId User ID
         * @returns Promise<OrganizationMember>
         */
        get: async (userId: string): Promise<OrganizationMember> => {
            const response = await this.fetch(`/organizations/${organizationSlug}/members/${userId}`)
            if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            return response.json() as Promise<OrganizationMember>
        },

        /**
         * Create member in an organization
         * @param userId User ID
         * @returns Promise<OrganizationMember>
         */
        create: async (userId: string): Promise<OrganizationMember> => {
            const response = await this.fetch(`/organizations/${organizationSlug}/members`, {
                method: 'POST',
                body: JSON.stringify({ userId }),
            })
            if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            return response.json() as Promise<OrganizationMember>
        },

        /**
         * Delete member from an organization
         * @param userId User ID
         */
        delete: async (userId: string): Promise<void> => {
            const response = await this.fetch(`/organizations/${organizationSlug}/members/${userId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
        },

        /**
         * Member OAuth namespace
         */
        oauth: {
            /**
             * Get OAuth URLs for a member
             * @param userId User ID
             * @param filter Filter by provider
             * @returns List of OAuth URLs
             */
            getUrls: async (
                userId: string,
                filter?: Provider[],
                options?: {
                    providerRedirectUrlOverwrites?: {
                        provider: Provider
                        redirectUrl: string
                    }[]
                }
            ): Promise<OAuthLink[]> => {
                const query = filter ? `?provider=${filter.join(',')}` : ''
                const response = await this.fetch(
                    `/organizations/${organizationSlug}/members/${userId}/oauth/links${query}`,
                    {
                        method: 'GET',
                        body: options ? JSON.stringify(options) : undefined,
                    }
                )
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
                return response.json() as Promise<OAuthLink[]>
            },

            /**
             * Get OAuth URL
             * @param provider Provider
             * @returns string
             */
            getURL: async (userId: string, provider: Provider, redirectUrl?: string): Promise<OAuthLink> => {
                const response = await this.fetch(
                    `/organizations/${organizationSlug}/members/${userId}/oauth/${provider}/link`,
                    {
                        method: 'POST',
                        body: redirectUrl ? JSON.stringify({ redirectUrl }) : undefined,
                    }
                )
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
                const { url } = (await response.json()) as { url: string }
                return { provider, url } as OAuthLink
            },

            /**
             * Verify OAuth code
             * @param userId User ID
             * @param provider Provider
             * @param code OAuth code
             */
            verifyCode: async (
                userId: string,
                provider: Provider,
                code: string,
                redirectUrl?: string
            ): Promise<void> => {
                const response = await this.fetch(
                    `/organizations/${organizationSlug}/members/${userId}/oauth/${provider}/verify`,
                    {
                        method: 'POST',
                        body: JSON.stringify({ code, redirectUrl }),
                    }
                )
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            },

            /**
             * Verify OAuth response
             * @param userId User ID
             * @param provider Provider
             * @param url Redirect response (the redirect response from the provider to your redirect URL)
             */
            verifyResponse: async (userId: string, provider: Provider, url: URL): Promise<void> => {
                const { code } = Object.fromEntries(url.searchParams.entries())
                const redirectUrl = url.origin
                const response = await this.fetch(
                    `/organizations/${organizationSlug}/members/${userId}/oauth/${provider}/verify`,
                    {
                        method: 'POST',
                        body: JSON.stringify({ code, redirectUrl }),
                    }
                )
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            },

            /**
             * Set OAuth token
             * @param userId User ID
             * @param provider Provider
             * @param credentials OAuth credentials
             */
            setToken: async (userId: string, provider: Provider, credentials: OAuthCredentials): Promise<void> => {
                const response = await this.fetch(
                    `/organizations/${organizationSlug}/members/${userId}/oauth/${provider}`,
                    {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                    }
                )
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            },

            /**
             * Remove OAuth connection
             * @param userId User ID
             * @param provider Provider
             */
            removeConnection: async (userId: string, provider: Provider): Promise<void> => {
                const response = await this.fetch(
                    `/organizations/${organizationSlug}/members/${userId}/oauth/${provider}`,
                    {
                        method: 'DELETE',
                    }
                )
                if (!response.ok) throw new Error(`[Recal] HTTP error! status: ${response.status}`)
            },
        },

        calendar: {
            // to be continued
        },
    })
}

export * from './types'
export default Recal
