import { Type as T } from '@sinclair/typebox'
import {
    EventNotFoundError,
    OAuthConnectionNotFoundError,
    OrganizationNotFoundError,
    ProviderCredentialsNotSetError,
    UserNotFoundError,
} from 'src/errors'
import { busySchema, eventSchema, timeRangeSchema } from 'src/typebox/calendar.tb'
import type {
    Busy,
    CreateEvent,
    CreateEventAcrossCalendars,
    Event,
    Provider,
    TimeRange,
    UpdateEvent,
    UpdateEventAcrossCalendars,
} from 'src/types/calendar.types'
import type { FetchHelper } from 'src/utils/fetch.helper'
import { errorHandler } from 'src/utils/fetch.helper'

export class CalendarService {
    constructor(private fetchHelper: FetchHelper) {}

    // ==========================================
    // MARK: User Calendar - Busy & Events
    // ==========================================

    /**
     * @param userId The ID of the user
     * @param minDate The start date of the free/busy period
     * @param maxDate The end date of the free/busy period
     * @param options The options for the free/busy query (optional)
     * @returns The free/busy period
     */
    public async getBusy(
        userId: string,
        minDate: Date,
        maxDate: Date,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<Busy> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .get(`/v1/users/${userId}/calendar/busy`, {
                schema: busySchema,
                searchParams: { minDate, maxDate, provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'all'
                        ),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param minDate The start date of the events
     * @param maxDate The end date of the events
     * @param options The options for the events query (optional)
     * @returns The events
     */
    public async getEvents(
        userId: string,
        minDate: Date,
        maxDate: Date,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<Event[]> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .get(`/v1/users/${userId}/calendar/events`, {
                schema: T.Array(eventSchema),
                searchParams: { minDate, maxDate, provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
                        ),
                        statusTextInclFilter: 'User has not the needed calendars connected',
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }

    // ==========================================
    // MARK: Meta Event Operations (Cross-Calendar)
    // ==========================================

    /**
     * @param userId The ID of the user
     * @param metaId The meta ID of the event
     * @param options The options for the event query (optional)
     * @returns The event
     */
    public async getEventByMetaId(
        userId: string,
        metaId: string,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<Event> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .get(`/v1/users/${userId}/calendar/events/meta/${metaId}`, {
                schema: eventSchema,
                searchParams: { provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
                        ),
                    },
                    { code: 404, error: new UserNotFoundError(userId), statusTextInclFilter: 'User not found' },
                    { code: 404, error: new EventNotFoundError(metaId) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param event The event to create
     * @param options The options for the event creation (optional)
     * @returns The created event
     */
    public async createEventByMetaId(
        userId: string,
        event: CreateEventAcrossCalendars,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<Event> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .post(`/v1/users/${userId}/calendar/events/meta`, {
                schema: eventSchema,
                searchParams: { provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
                body: { event },
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
                        ),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param metaId The meta ID of the event
     * @param event The updated event
     * @param options The options for the event update (optional)
     * @returns The updated event
     */
    public async updateEventByMetaId(
        userId: string,
        metaId: string,
        event: UpdateEventAcrossCalendars,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<Event> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .put(`/v1/users/${userId}/calendar/events/meta/${metaId}`, {
                schema: eventSchema,
                searchParams: { provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
                body: { event },
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
                        ),
                    },
                    { code: 404, error: new UserNotFoundError(userId), statusTextInclFilter: 'User not found' },
                    { code: 404, error: new EventNotFoundError(metaId) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param metaId The meta ID of the event
     * @param options The options for the event deletion (optional)
     * @returns void
     */
    public async deleteEventByMetaId(
        userId: string,
        metaId: string,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<void> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .delete(`/v1/users/${userId}/calendar/events/meta/${metaId}`, {
                searchParams: { provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
                schema: T.Void(),
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
                        ),
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }

    // ==========================================
    // MARK: Provider-Specific Event Operations
    // ==========================================

    /**
     * @param userId The ID of the user
     * @param provider The provider of the calendar
     * @param calendarId The ID of the calendar
     * @param eventId The ID of the event
     * @param options The options for the event query (optional)
     * @returns The event
     */
    public async getEvent({
        userId,
        provider,
        calendarId = 'primary',
        eventId,
        options,
    }: {
        userId: string
        provider: Provider
        calendarId?: string
        eventId: string
        options?: {
            timeZone?: string
        }
    }): Promise<Event> {
        const { timeZone } = options || {}
        return this.fetchHelper
            .get(`/v1/users/${userId}/calendar/events/${provider}/${calendarId}/${eventId}`, {
                schema: eventSchema,
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(userId, provider),
                        statusTextInclFilter: 'User has not connected this calendar provider',
                    },
                    { code: 404, error: new UserNotFoundError(userId), statusTextInclFilter: 'User not found' },
                    { code: 404, error: new EventNotFoundError(eventId), statusTextInclFilter: 'Event not found' },
                    { code: 404, error: new ProviderCredentialsNotSetError(provider) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param provider The provider of the calendar
     * @param calendarId The ID of the calendar
     * @param event The event to create
     * @param options The options for the event creation (optional)
     * @returns The created event
     */
    public async createEvent({
        userId,
        provider,
        calendarId = 'primary',
        event,
        options,
    }: {
        userId: string
        provider: Provider
        calendarId?: string
        event: CreateEvent
        options?: {
            timeZone?: string
        }
    }): Promise<Event> {
        const { timeZone } = options || {}
        return this.fetchHelper
            .post(`/v1/users/${userId}/calendar/events/${provider}/${calendarId}`, {
                schema: eventSchema,
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
                body: { event },
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(userId, provider),
                        statusTextInclFilter: 'User has not connected this calendar provider',
                    },
                    { code: 404, error: new UserNotFoundError(userId), statusTextInclFilter: 'User not found' },
                    { code: 404, error: new ProviderCredentialsNotSetError(provider) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param provider The provider of the calendar
     * @param calendarId The ID of the calendar
     * @param eventId The ID of the event
     * @param event The updated event
     * @param options The options for the event update (optional)
     * @returns The updated event
     */
    public async updateEvent({
        userId,
        provider,
        calendarId = 'primary',
        eventId,
        event,
        options,
    }: {
        userId: string
        provider: Provider
        calendarId?: string
        eventId: string
        event: UpdateEvent
        options?: {
            timeZone?: string
        }
    }): Promise<Event> {
        const { timeZone } = options || {}
        return this.fetchHelper
            .put(`/v1/users/${userId}/calendar/events/${provider}/${calendarId}/${eventId}`, {
                schema: eventSchema,
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
                body: { event },
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(userId, provider),
                        statusTextInclFilter: 'User has not connected this calendar provider',
                    },
                    { code: 404, error: new UserNotFoundError(userId), statusTextInclFilter: 'User not found' },
                    { code: 404, error: new ProviderCredentialsNotSetError(provider) },
                ])
            )
    }

    /**
     * @param userId The ID of the user
     * @param provider The provider of the calendar
     * @param calendarId The ID of the calendar
     * @param eventId The ID of the event
     * @param options The options for the event deletion (optional)
     * @returns void
     */
    public async deleteEvent({
        userId,
        provider,
        calendarId = 'primary',
        eventId,
        options,
    }: {
        userId: string
        provider: Provider
        calendarId?: string
        eventId: string
        options?: {
            timeZone?: string
        }
    }): Promise<void> {
        const { timeZone } = options || {}
        return this.fetchHelper
            .delete(`/v1/users/${userId}/calendar/events/${provider}/${calendarId}/${eventId}`, {
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
                schema: T.Void(),
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new OAuthConnectionNotFoundError(userId, provider),
                        statusTextInclFilter: 'User has not connected this calendar provider',
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                    { code: 404, error: new EventNotFoundError(eventId) },
                ])
            )
    }

    // ==========================================
    // MARK: Organization-Wide Operations
    // ==========================================

    /**
     * Get the org-wide busy period
     * @param slug The slug of the organization
     * @param minDate The minimum date
     * @param maxDate The maximum date
     * @param primaryOnly Whether to only include the primary calendar (default: true)
     * @param options The options for the org-wide free/busy query (optional)
     * @returns The org-wide free/busy period
     */
    public async getOrgWideBusy(
        slug: string,
        minDate: Date,
        maxDate: Date,
        primaryOnly?: boolean,
        options?: {
            provider?: Provider | Provider[]
            timeZone?: string
        }
    ): Promise<TimeRange[]> {
        const { provider, timeZone } = options || {}
        return this.fetchHelper
            .get(`/v1/organizations/${slug}/calendar/busy`, {
                schema: T.Array(timeRangeSchema),
                searchParams: { minDate, maxDate, primaryOnly, provider },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        error: new Error(`OAuth credentials for provider ${provider} not found for the user`),
                    },
                    { code: 404, error: new OrganizationNotFoundError(slug) },
                ])
            )
    }
}
