import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetV1UsersByUserIdCalendarBusyData,
    GetV1UsersByUserIdCalendarBusyResponses,
    GetV1UsersByUserIdCalendarData,
    GetV1UsersByUserIdCalendarEventsData,
} from '../client/types.gen'
import { unwrapEnvelope, unwrapResponse } from '../utils/response'

/**
 * Calendar Service
 *
 * Provides methods for managing calendars
 */
export class CalendarService {
    constructor(private client: Client) {}

    /**
     * List all calendars for a user
     *
     * @param userId - The user ID
     * @param options - Query options
     *
     * @example
     * ```typescript
     * const calendars = await recal.calendar.list('user-123', {
     *   provider: 'google'
     * })
     * ```
     */
    async list(userId: string, options?: GetV1UsersByUserIdCalendarData['query']) {
        const response = await sdk.getV1UsersByUserIdCalendar({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }

    /**
     * Get busy times for a user across all calendars
     *
     * @param userId - The user ID
     * @param options - Query options with time range
     *
     * @example
     * ```typescript
     * const { data, failedCalendars } = await recal.calendar.getBusyTimes('user-123', {
     *   start: '2024-01-01T00:00:00Z',
     *   end: '2024-01-31T23:59:59Z',
     *   provider: ['google', 'microsoft']
     * })
     * ```
     *
     * A non-empty `failedCalendars` means `data` is a partial answer: those calendars
     * could not be read, so a window they cover may look free when it is not. Each entry
     * names the calendar, its provider, a `reason` code and a message.
     */
    async getBusyTimes(userId: string, options: GetV1UsersByUserIdCalendarBusyData['query']) {
        const response = await sdk.getV1UsersByUserIdCalendarBusy({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapEnvelope<GetV1UsersByUserIdCalendarBusyResponses[200]>(response)
    }

    /**
     * List events for a user across all calendars
     *
     * @param userId - The user ID
     * @param options - Query options with time range
     *
     * @example
     * ```typescript
     * const events = await recal.calendar.listEvents('user-123', {
     *   start: '2024-01-01T00:00:00Z',
     *   end: '2024-01-31T23:59:59Z',
     *   provider: 'google'
     * })
     * ```
     */
    async listEvents(userId: string, options: GetV1UsersByUserIdCalendarEventsData['query']) {
        const response = await sdk.getV1UsersByUserIdCalendarEvents({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }
}
