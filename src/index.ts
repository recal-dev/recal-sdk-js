import { Provider, RecalOptions, TimeRange } from './types'
import type { Organization, OrganizationMember } from './types/entity.types'
import { OAuthCredentials, OAuthLink } from './types/oauth.types'
import {
    Event,
    CreateEventAcrossCalendars,
    UpdateEventAcrossCalendars,
    CreateEvent,
    UpdateEvent,
} from './types/calendar.types'
import { OrganizationService } from './services/organization.service'
import { MemberService } from './services/member.service'

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
    private organizationService: OrganizationService

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
        this.organizationService = new OrganizationService(this.fetch)
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
            return this.organizationService.list()
        },

        /**
         * Get organization by slug
         * @param slug Organization slug
         * @returns Promise<Organization>
         */
        get: async (slug: string): Promise<Organization> => {
            return this.organizationService.get(slug)
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
                return this.organizationService.getFreeBusy(organizationSlug, timeRange, primaryOnly, provider)
            },
        },
    }

    // Member
    /**
     * Member namespace
     */
    members = (organizationSlug: string) => {
        const memberService = new MemberService(organizationSlug, this.fetch)

        return {
            /**
             * List members of an organization
             * @returns Promise<OrganizationMember[]>
             */
            list: async (): Promise<OrganizationMember[]> => {
                return memberService.list()
            },

            /**
             * Get member of an organization
             * @param userId User ID
             * @returns Promise<OrganizationMember>
             */
            get: async (userId: string): Promise<OrganizationMember> => {
                return memberService.get(userId)
            },

            /**
             * Create member in an organization
             * @param userId User ID
             * @returns Promise<OrganizationMember>
             */
            create: async (userId: string): Promise<OrganizationMember> => {
                return memberService.create(userId)
            },

            /**
             * Delete member from an organization
             * @param userId User ID
             */
            delete: async (userId: string): Promise<void> => {
                return memberService.delete(userId)
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
                    return memberService.oauth.getUrls(userId, filter, options)
                },

                /**
                 * Get OAuth URL
                 * @param provider Provider
                 * @returns string
                 */
                getURL: async (userId: string, provider: Provider, redirectUrl?: string): Promise<OAuthLink> => {
                    return memberService.oauth.getURL(userId, provider, redirectUrl)
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
                    return memberService.oauth.verifyCode(userId, provider, code, redirectUrl)
                },

                /**
                 * Verify OAuth response
                 * @param userId User ID
                 * @param provider Provider
                 * @param url Redirect response (the redirect response from the provider to your redirect URL)
                 */
                verifyResponse: async (userId: string, provider: Provider, url: URL): Promise<void> => {
                    return memberService.oauth.verifyResponse(userId, provider, url)
                },

                /**
                 * Set OAuth token
                 * @param userId User ID
                 * @param provider Provider
                 * @param credentials OAuth credentials
                 */
                setToken: async (userId: string, provider: Provider, credentials: OAuthCredentials): Promise<void> => {
                    return memberService.oauth.setToken(userId, provider, credentials)
                },

                /**
                 * Remove OAuth connection
                 * @param userId User ID
                 * @param provider Provider
                 */
                removeConnection: async (userId: string, provider: Provider): Promise<void> => {
                    return memberService.oauth.removeConnection(userId, provider)
                },
            },

            /**
             * Member Calendar namespace
             */
            calendar: {
                /**
                 * Gets the free-busy times for a member across all their calendars
                 */
                getFreeBusy: async (
                    userId: string,
                    timeRange: TimeRange,
                    provider?: Provider[]
                ): Promise<TimeRange[]> => {
                    return memberService.calendar.getFreeBusy({
                        orgSlug: organizationSlug,
                        userId,
                        timeMin: timeRange.start,
                        timeMax: timeRange.end,
                        provider,
                    })
                },

                /**
                 * Gets events for a member across all their calendars
                 */
                getEvents: async (userId: string, timeRange: TimeRange, provider?: Provider[]): Promise<Event[]> => {
                    return memberService.calendar.getEvents({
                        orgSlug: organizationSlug,
                        userId,
                        timeMin: timeRange.start,
                        timeMax: timeRange.end,
                        provider,
                    })
                },

                /**
                 * Creates an event for a member across all their calendars
                 */
                createEvent: async (
                    userId: string,
                    event: CreateEventAcrossCalendars,
                    provider?: Provider[]
                ): Promise<Event[]> => {
                    return memberService.calendar.createEvent({
                        orgSlug: organizationSlug,
                        userId,
                        event,
                        provider,
                    })
                },

                /**
                 * Gets an event by metaId for a member across all their calendars
                 */
                getEventByMetaId: async (
                    userId: string,
                    metaId: string,
                    provider?: Provider[]
                ): Promise<Event | null> => {
                    return memberService.calendar.getEventByMetaId({
                        orgSlug: organizationSlug,
                        userId,
                        metaId,
                        provider,
                    })
                },

                /**
                 * Updates an event by metaId for a member across all their calendars
                 */
                updateEventByMetaId: async (
                    userId: string,
                    metaId: string,
                    event: UpdateEventAcrossCalendars,
                    provider?: Provider[]
                ): Promise<Event[]> => {
                    return memberService.calendar.updateEventByMetaId({
                        orgSlug: organizationSlug,
                        userId,
                        metaId,
                        event,
                        provider,
                    })
                },

                /**
                 * Deletes an event by metaId for a member across all their calendars
                 */
                deleteEventByMetaId: async (userId: string, metaId: string, provider?: Provider[]): Promise<void> => {
                    await memberService.calendar.deleteEventByMetaId({
                        orgSlug: organizationSlug,
                        userId,
                        metaId,
                        provider,
                    })
                },

                /**
                 * Creates an event for a member for a specific calendar and provider
                 */
                createEventForSpecificCalendar: async (
                    userId: string,
                    provider: Provider,
                    calendarId: string,
                    event: CreateEvent
                ): Promise<Event> => {
                    return memberService.calendar.createEventForSpecificCalendar({
                        orgSlug: organizationSlug,
                        userId,
                        provider,
                        calendarId,
                        event,
                    })
                },

                /**
                 * Gets an event for a member for a specific calendar and provider
                 */
                getEventFromSpecificCalendar: async (
                    userId: string,
                    provider: Provider,
                    calendarId: string,
                    eventId: string
                ): Promise<Event> => {
                    return memberService.calendar.getEventFromSpecificCalendar({
                        orgSlug: organizationSlug,
                        userId,
                        provider,
                        calendarId,
                        eventId,
                    })
                },

                /**
                 * Updates an event for a member for a specific calendar and provider
                 */
                updateEventInSpecificCalendar: async (
                    userId: string,
                    provider: Provider,
                    calendarId: string,
                    eventId: string,
                    event: UpdateEvent
                ): Promise<Event> => {
                    return memberService.calendar.updateEventInSpecificCalendar({
                        orgSlug: organizationSlug,
                        userId,
                        provider,
                        calendarId,
                        eventId,
                        event,
                    })
                },

                /**
                 * Deletes an event for a member for a specific calendar and provider
                 */
                deleteEventFromSpecificCalendar: async (
                    userId: string,
                    provider: Provider,
                    calendarId: string,
                    eventId: string
                ): Promise<Event | { success: boolean }> => {
                    return memberService.calendar.deleteEventFromSpecificCalendar({
                        orgSlug: organizationSlug,
                        userId,
                        provider,
                        calendarId,
                        eventId,
                    })
                },
            },
        }
    }
}

export * from './types'
export default Recal
