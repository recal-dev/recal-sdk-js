import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    CreateEvent,
    CreateMetaEvent,
    PostV1UsersUserIdCalendarEventsMetaData,
    UpdateEvent,
} from '../client/types.gen'
import { unwrapResponse } from '../utils/response'

/**
 * Events Service
 *
 * Provides methods for managing calendar events
 */
export class EventsService {
    constructor(private client: Client) {}

    /**
     * Create an event across all calendars by metaId
     *
     * @param userId - The user ID
     * @param event - Event data
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const event = await recal.events.createMetaEvent('user-123', {
     *   subject: 'Team Meeting',
     *   start: '2024-01-15T10:00:00Z',
     *   end: '2024-01-15T11:00:00Z',
     *   attendees: [{ email: 'team@example.com' }],
     *   meeting: true
     * }, { provider: ['google'] })
     * ```
     */
    async createMetaEvent(
        userId: string,
        event: CreateMetaEvent,
        options?: PostV1UsersUserIdCalendarEventsMetaData['query']
    ) {
        const response = await sdk.postV1UsersUserIdCalendarEventsMeta({
            path: { userId },
            body: event,
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get an event by metaId
     *
     * @param userId - The user ID
     * @param metaId - The event metaId
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const event = await recal.events.getMetaEvent('user-123', 'meta-456')
     * ```
     */
    async getMetaEvent(
        userId: string,
        metaId: string,
        options?: { provider?: Array<'google' | 'microsoft'> | 'google' | 'microsoft' }
    ) {
        const response = await sdk.getV1UsersUserIdCalendarEventsMetaMetaId({
            path: { userId, metaId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Update an event by metaId
     *
     * @param userId - The user ID
     * @param metaId - The event metaId
     * @param event - Updated event data
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const updated = await recal.events.updateMetaEvent('user-123', 'meta-456', {
     *   subject: 'Updated Meeting',
     *   sendNotifications: true
     * })
     * ```
     */
    async updateMetaEvent(
        userId: string,
        metaId: string,
        event: UpdateEvent,
        options?: { provider?: Array<'google' | 'microsoft'> | 'google' | 'microsoft' }
    ) {
        const response = await sdk.putV1UsersUserIdCalendarEventsMetaMetaId({
            path: { userId, metaId },
            body: event,
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Delete an event by metaId
     *
     * @param userId - The user ID
     * @param metaId - The event metaId
     * @param options - Query options
     *
     * @example
     * ```typescript
     * await recal.events.deleteMetaEvent('user-123', 'meta-456')
     * ```
     */
    async deleteMetaEvent(
        userId: string,
        metaId: string,
        options?: { provider?: Array<'google' | 'microsoft'> | 'google' | 'microsoft' }
    ) {
        const response = await sdk.deleteV1UsersUserIdCalendarEventsMetaMetaId({
            path: { userId, metaId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Create an event in a specific calendar
     *
     * @param userId - The user ID
     * @param provider - The calendar provider
     * @param calendarId - The calendar ID
     * @param event - Event data
     *
     * @example
     * ```typescript
     * const event = await recal.events.createEvent(
     *   'user-123',
     *   'google',
     *   'primary',
     *   {
     *     subject: 'Meeting',
     *     start: '2024-01-16T14:00:00Z',
     *     end: '2024-01-16T15:00:00Z',
     *     attendees: [{ email: 'team@example.com' }]
     *   }
     * )
     * ```
     */
    async createEvent(userId: string, provider: 'google' | 'microsoft', calendarId: string, event: CreateEvent) {
        const response = await sdk.postV1UsersUserIdCalendarEventsProviderCalendarId({
            path: { userId, provider, calendarId },
            body: event,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get an event from a specific calendar
     *
     * @param userId - The user ID
     * @param provider - The calendar provider
     * @param calendarId - The calendar ID
     * @param eventId - The event ID
     *
     * @example
     * ```typescript
     * const event = await recal.events.getEvent(
     *   'user-123',
     *   'google',
     *   'primary',
     *   'event-id'
     * )
     * ```
     */
    async getEvent(userId: string, provider: 'google' | 'microsoft', calendarId: string, eventId: string) {
        const response = await sdk.getV1UsersUserIdCalendarEventsProviderCalendarIdEventId({
            path: { userId, provider, calendarId, eventId },
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Update an event in a specific calendar
     *
     * @param userId - The user ID
     * @param provider - The calendar provider
     * @param calendarId - The calendar ID
     * @param eventId - The event ID
     * @param event - Updated event data
     *
     * @example
     * ```typescript
     * const updated = await recal.events.updateEvent(
     *   'user-123',
     *   'google',
     *   'primary',
     *   'event-id',
     *   { subject: 'Updated Title' }
     * )
     * ```
     */
    async updateEvent(
        userId: string,
        provider: 'google' | 'microsoft',
        calendarId: string,
        eventId: string,
        event: UpdateEvent
    ) {
        const response = await sdk.putV1UsersUserIdCalendarEventsProviderCalendarIdEventId({
            path: { userId, provider, calendarId, eventId },
            body: event,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Delete an event from a specific calendar
     *
     * @param userId - The user ID
     * @param provider - The calendar provider
     * @param calendarId - The calendar ID
     * @param eventId - The event ID
     *
     * @example
     * ```typescript
     * await recal.events.deleteEvent(
     *   'user-123',
     *   'google',
     *   'primary',
     *   'event-id'
     * )
     * ```
     */
    async deleteEvent(userId: string, provider: 'google' | 'microsoft', calendarId: string, eventId: string) {
        const response = await sdk.deleteV1UsersUserIdCalendarEventsProviderCalendarIdEventId({
            path: { userId, provider, calendarId, eventId },
            client: this.client,
        })
        return unwrapResponse(response)
    }
}
