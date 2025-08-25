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
     * @param minDate The start date of the busy period
     * @param maxDate The end date of the busy period
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The busy period
     */
    public async getBusy(
        userId: string,
        minDate: Date,
        maxDate: Date,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<Busy> {
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
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
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
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The events
     */
    public async getEvents(
        userId: string,
        minDate: Date,
        maxDate: Date,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<Event[]> {
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
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The event
     */
    public async getEventByMetaId(
        userId: string,
        metaId: string,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<Event> {
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
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The created event
     */
    public async createEventByMetaId(
        userId: string,
        event: CreateEventAcrossCalendars,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<Event> {
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
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The updated event
     */
    public async updateEventByMetaId(
        userId: string,
        metaId: string,
        event: UpdateEventAcrossCalendars,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<Event> {
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
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The deleted event
     */
    public async deleteEventByMetaId(
        userId: string,
        metaId: string,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<void> {
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
     * @param timeZone The time zone of the calendar (optional)
     * @returns The event
     */
    public async getEvent(
        userId: string,
        provider: Provider,
        calendarId: string,
        eventId: string,
        timeZone?: string
    ): Promise<Event> {
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
     * @param timeZone The time zone of the calendar (optional)
     * @returns The created event
     */
    public async createEvent(
        userId: string,
        provider: Provider,
        calendarId: string,
        event: CreateEvent,
        timeZone?: string
    ): Promise<Event> {
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
     * @param timeZone The time zone of the calendar (optional)
     * @returns The updated event
     */
    public async updateEvent(
        userId: string,
        provider: Provider,
        calendarId: string,
        eventId: string,
        event: UpdateEvent,
        timeZone?: string
    ): Promise<Event> {
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
     * @param timeZone The time zone of the calendar (optional)
     * @returns The deleted event
     */
    public async deleteEvent(
        userId: string,
        provider: Provider,
        calendarId: string,
        eventId: string,
        timeZone?: string
    ): Promise<void> {
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
     * @param primaryOnly Whether to only include the primary calendar
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone
     * @returns The org-wide busy period
     */
    public async getOrgWideBusy(
        slug: string,
        minDate: Date,
        maxDate: Date,
        primaryOnly?: boolean,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<TimeRange[]> {
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
