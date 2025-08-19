import { Type as T } from '@sinclair/typebox'
import { EventNotFoundError, OAuthConnectionNotFoundError, UserNotFoundError } from 'src/errors'
import { eventSchema, freeBusySchema } from 'src/typebox/calendar.tb'
import type {
    CreateEventAcrossCalendars,
    Event,
    FreeBusy,
    Provider,
    UpdateEventAcrossCalendars,
} from 'src/types/calendar.types'
import type { FetchHelper } from 'src/utils/fetch.helper'
import { errorHandler } from 'src/utils/fetch.helper'

export class CalendarService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * @param userId The ID of the user
     * @param minDate The start date of the free/busy period
     * @param maxDate The end date of the free/busy period
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param timeZone The time zone of the calendar (optional)
     * @returns The free/busy period
     */
    public async getFreeBusy(
        userId: string,
        minDate: Date,
        maxDate: Date,
        provider?: Provider | Provider[],
        timeZone?: string
    ): Promise<FreeBusy> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/calendar/free-busy`, {
                schema: freeBusySchema,
                searchParams: { minDate, maxDate, provider, timeZone },
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
                searchParams: { minDate, maxDate, provider, timeZone },
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
                searchParams: { provider, timeZone },
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
                searchParams: { provider, timeZone },
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
     * @param event The event to update
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
                searchParams: { provider, timeZone },
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
                searchParams: { provider, timeZone },
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
}
