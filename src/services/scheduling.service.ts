import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetUsersUserIdSchedulingData,
    PostUsersSchedulingData,
    PostUsersUserIdSchedulingData,
} from '../client/types.gen'

/**
 * Scheduling Service
 *
 * Provides methods for finding available time slots
 */
export class SchedulingService {
    constructor(private client: Client) {}

    /**
     * Get available time slots for a user (basic parameters)
     *
     * @param userId - The user ID
     * @param options - Scheduling options
     *
     * @example
     * ```typescript
     * const slots = await recal.scheduling.getSlots('user-123', {
     *   start: '2024-01-15T00:00:00Z',
     *   end: '2024-01-19T23:59:59Z',
     *   slotDuration: '30',
     *   padding: '15',
     *   provider: 'google'
     * })
     * ```
     */
    async getSlots(userId: string, options: GetUsersUserIdSchedulingData['query']) {
        return sdk.getUsersUserIdScheduling({
            path: { userId },
            query: options,
            client: this.client,
        })
    }

    /**
     * Get available time slots for a user (advanced with custom schedules)
     *
     * @param userId - The user ID
     * @param options - Query scheduling options
     * @param body - Custom schedules
     *
     * @example
     * ```typescript
     * const slots = await recal.scheduling.getAdvancedSlots(
     *   'user-123',
     *   {
     *     start: '2024-01-15T00:00:00Z',
     *     end: '2024-01-19T23:59:59Z',
     *     slotDuration: '60',
     *     padding: '10'
     *   },
     *   {
     *     schedules: [
     *       {
     *         days: ['monday', 'wednesday', 'friday'],
     *         start: '09:00',
     *         end: '17:00'
     *       }
     *     ]
     *   }
     * )
     * ```
     */
    async getAdvancedSlots(
        userId: string,
        options: PostUsersUserIdSchedulingData['query'],
        body?: PostUsersUserIdSchedulingData['body']
    ) {
        return sdk.postUsersUserIdScheduling({
            path: { userId },
            query: options,
            body,
            client: this.client,
        })
    }

    /**
     * Get available time slots for multiple users
     *
     * @param options - Query scheduling options
     * @param users - Array of users with optional schedules
     *
     * @example
     * ```typescript
     * const slots = await recal.scheduling.getMultiUserSlots(
     *   {
     *     start: '2024-01-15T00:00:00Z',
     *     end: '2024-01-19T23:59:59Z',
     *     slotDuration: '60',
     *     padding: '10'
     *   },
     *   {
     *     users: [
     *       {
     *         id: 'user-1',
     *         schedules: [{ days: ['monday'], start: '09:00', end: '17:00' }]
     *       },
     *       { id: 'user-2' }
     *     ]
     *   }
     * )
     * ```
     */
    async getMultiUserSlots(options: PostUsersSchedulingData['query'], body?: PostUsersSchedulingData['body']) {
        return sdk.postUsersScheduling({
            query: options,
            body,
            client: this.client,
        })
    }
}
