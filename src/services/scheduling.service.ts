import type { Client } from '../client/client'
import * as sdk from '../client/sdk.gen'
import type {
    GetV1UsersByUserIdSchedulingData,
    PostV1UsersByUserIdSchedulingData,
    PostV1UsersSchedulingData,
} from '../client/types.gen'
import { unwrapResponse } from '../utils/response'

type MultiUserSlotsItem = { availableSlots?: unknown[]; options?: { start?: unknown; end?: unknown } }

/**
 * Coerces date strings on a multi-user slots response, skipping per-user error entries.
 *
 * `POST /v1/users/scheduling` answers 200 with one entry per user, discriminated by
 * `status`: slots when `'ok'`, `{ error }` when `'error'`. HeyAPI flattens that union
 * and generates a transformer that dereferences `availableSlots` unconditionally, so an
 * error entry crashes it before the caller can read the message. Overrides the generated
 * transformer, which `sdk.gen.ts` spreads `options` over.
 *
 * Keys off the presence of `availableSlots` rather than `status`, so it behaves correctly
 * against API versions from either side of the `status` rollout.
 */
const multiUserSlotsResponseTransformer = async (data: unknown): Promise<unknown> => {
    const payload = data as { data?: MultiUserSlotsItem[] }
    if (!Array.isArray(payload?.data)) return data

    for (const item of payload.data) {
        if (!Array.isArray(item?.availableSlots)) continue
        item.availableSlots = item.availableSlots.map((slot) => {
            const range = slot as { start?: unknown; end?: unknown }
            return { ...range, start: new Date(range.start as string), end: new Date(range.end as string) }
        })
        if (item.options) {
            item.options.start = new Date(item.options.start as string)
            item.options.end = new Date(item.options.end as string)
        }
    }
    return data
}

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
    async getSlots(userId: string, options: GetV1UsersByUserIdSchedulingData['query']) {
        const response = await sdk.getV1UsersByUserIdScheduling({
            path: { userId },
            query: options,
            client: this.client,
        })
        return unwrapResponse(response)
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
        options: PostV1UsersByUserIdSchedulingData['query'],
        body: PostV1UsersByUserIdSchedulingData['body']
    ) {
        const response = await sdk.postV1UsersByUserIdScheduling({
            path: { userId },
            query: options,
            body,
            client: this.client,
        })
        return unwrapResponse(response)
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
    async getMultiUserSlots(options: PostV1UsersSchedulingData['query'], body: PostV1UsersSchedulingData['body']) {
        const response = await sdk.postV1UsersScheduling({
            query: options,
            body,
            client: this.client,
            responseTransformer: multiUserSlotsResponseTransformer,
        })
        return unwrapResponse(response)
    }
}
