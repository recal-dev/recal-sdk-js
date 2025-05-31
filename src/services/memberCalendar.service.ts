import {
    Provider,
    Event,
    TimeRange,
    CalendarRequest,
    TimeRangeFilter,
    CreateEventAcrossCalendars,
    UpdateEventAcrossCalendars,
    CreateEvent,
    UpdateEvent,
    SpecificCalendarEvent,
} from '../types/calendar.types'

/**
 * Service class for handling member calendar operations
 */
export class MemberCalendarService {
    private baseUrl: string
    private fetch: (input: string, init?: RequestInit) => Promise<Response>

    /**
     * Creates a new instance of MemberCalendarService
     * @param baseUrl The base URL for the API
     * @param fetch Fetch function with authentication
     */
    constructor(baseUrl: string, fetch: (input: string, init?: RequestInit) => Promise<Response>) {
        this.baseUrl = baseUrl
        this.fetch = fetch
    }

    /**
     * Gets the free-busy times for a member across all their calendars
     * @param params Calendar and time range parameters
     * @returns Promise resolving to an array of TimeRange objects
     */
    async getFreeBusy(request: CalendarRequest & TimeRangeFilter): Promise<TimeRange[]> {
        const { orgSlug, userId, timeMin, timeMax, provider } = request
        const providerQuery = provider ? `&provider=${provider.join(',')}` : ''
        const query = `?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}${providerQuery}`
        const response = await this.fetch(`/organizations/${orgSlug}/members/${userId}/calendar/freeBusy${query}`)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get free-busy: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<TimeRange[]>
    }

    /**
     * Gets events for a member across all their calendars
     * @param params Calendar and time range parameters
     * @returns Promise resolving to an array of Event objects
     */
    async getEvents(params: CalendarRequest & TimeRangeFilter): Promise<Event[]> {
        const { orgSlug, userId, timeMin, timeMax, provider } = params
        const providerQuery = provider ? `&provider=${provider.join(',')}` : ''
        const query = `?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}${providerQuery}`

        const response = await this.fetch(`/organizations/${orgSlug}/members/${userId}/calendar/events${query}`)

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get events: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event[]>
    }

    /**
     * Creates an event for a member across all their calendars
     * @param params Calendar and event parameters
     * @returns Promise resolving to an array of created Event objects
     */
    async createEvent(
        params: CalendarRequest & { event: CreateEventAcrossCalendars; provider?: Provider[] }
    ): Promise<Event[]> {
        const { orgSlug, userId, event, provider } = params
        const providerQuery = provider ? `?provider=${provider.join(',')}` : ''

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/events${providerQuery}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to create event: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event[]>
    }

    /**
     * Gets an event by metaId for a member across all their calendars
     * @param params Calendar and metaId parameters
     * @returns Promise resolving to an Event object or null if not found
     */
    async getEventByMetaId(params: CalendarRequest & { metaId: string; provider?: Provider[] }): Promise<Event | null> {
        const { orgSlug, userId, metaId, provider } = params
        const providerQuery = provider ? `?provider=${provider.join(',')}` : ''

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/events/${metaId}${providerQuery}`
        )

        if (response.status === 404) {
            return null
        }

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get event by metaId: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event>
    }

    /**
     * Updates an event by metaId for a member across all their calendars
     * @param params Calendar, metaId, and event parameters
     * @returns Promise resolving to an array of updated Event objects
     */
    async updateEventByMetaId(
        params: CalendarRequest & {
            metaId: string
            event: UpdateEventAcrossCalendars
            provider?: Provider[]
        }
    ): Promise<Event[]> {
        const { orgSlug, userId, metaId, event, provider } = params
        const providerQuery = provider ? `?provider=${provider.join(',')}` : ''

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/events/${metaId}${providerQuery}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to update event by metaId: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event[]>
    }

    /**
     * Deletes an event by metaId for a member across all their calendars
     * @param params Calendar and metaId parameters
     * @returns Promise resolving to an array of deletion results
     */
    async deleteEventByMetaId(
        params: CalendarRequest & {
            metaId: string
            provider?: Provider[]
        }
    ): Promise<void> {
        const { orgSlug, userId, metaId, provider } = params
        const providerQuery = provider ? `?provider=${provider.join(',')}` : ''

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/events/${metaId}${providerQuery}`,
            {
                method: 'DELETE',
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to delete event by metaId: Status ${response.status} - ${errorText}`)
        }
    }

    /**
     * Creates an event for a member for a specific calendar and provider
     * @param params Calendar parameters, provider, calendarId, and event details
     * @returns Promise resolving to the created Event object
     */
    async createEventForSpecificCalendar(
        params: CalendarRequest & { provider: Provider; calendarId: string; event: CreateEvent }
    ): Promise<Event> {
        const { orgSlug, userId, provider, calendarId, event } = params

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/${provider}/${calendarId}/events`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to create event for specific calendar: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event>
    }

    /**
     * Gets an event for a member for a specific calendar and provider
     * @param params Calendar parameters, provider, calendarId, and eventId
     * @returns Promise resolving to the Event object
     */
    async getEventFromSpecificCalendar(params: CalendarRequest & SpecificCalendarEvent): Promise<Event> {
        const { orgSlug, userId, provider, calendarId, eventId } = params

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/${provider}/${calendarId}/events/${eventId}`
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get event from specific calendar: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event>
    }

    /**
     * Updates an event for a member for a specific calendar and provider
     * @param params Calendar parameters, provider, calendarId, eventId, and event update details
     * @returns Promise resolving to the updated Event object
     */
    async updateEventInSpecificCalendar(
        params: CalendarRequest & SpecificCalendarEvent & { event: UpdateEvent }
    ): Promise<Event> {
        const { orgSlug, userId, provider, calendarId, eventId, event } = params

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/${provider}/${calendarId}/events/${eventId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to update event in specific calendar: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event>
    }

    /**
     * Deletes an event for a member for a specific calendar and provider
     * @param params Calendar parameters, provider, calendarId, and eventId
     * @returns Promise resolving to the deleted Event object or a success indicator
     */
    async deleteEventFromSpecificCalendar(
        params: CalendarRequest & SpecificCalendarEvent
    ): Promise<Event | { success: boolean }> {
        const { orgSlug, userId, provider, calendarId, eventId } = params

        const response = await this.fetch(
            `/organizations/${orgSlug}/members/${userId}/calendar/${provider}/${calendarId}/events/${eventId}`,
            {
                method: 'DELETE',
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to delete event from specific calendar: Status ${response.status} - ${errorText}`)
        }

        return response.json() as Promise<Event | { success: boolean }>
    }
}
