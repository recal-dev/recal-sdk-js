import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetV1UsersUserIdCalendarBusyData,
    GetV1UsersUserIdCalendarData,
    GetV1UsersUserIdCalendarEventsData,
} from '../client/types.gen'
import { unwrapResponse } from '../utils/response'

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
    async list(userId: string, options?: GetV1UsersUserIdCalendarData['query']) {
        const response = await sdk.getV1UsersUserIdCalendar({
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
     * const busy = await recal.calendar.getBusyTimes('user-123', {
     *   start: '2024-01-01T00:00:00Z',
     *   end: '2024-01-31T23:59:59Z',
     *   provider: ['google', 'microsoft']
     * })
     * ```
     */
    async getBusyTimes(userId: string, options: GetV1UsersUserIdCalendarBusyData['query']) {
        const response = await sdk.getV1UsersUserIdCalendarBusy({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
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
    async listEvents(userId: string, options: GetV1UsersUserIdCalendarEventsData['query']) {
        const response = await sdk.getV1UsersUserIdCalendarEvents({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
    }
}
