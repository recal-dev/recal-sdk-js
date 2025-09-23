import { OAuthConnectionNotFoundError, OrganizationNotFoundError, UserNotFoundError } from '@/errors.js'
import {
    orgSchedulingResponseSchema,
    userAdvancedSchedulingResponseSchema,
    userSchedulingResponseSchema,
} from '@/typebox/scheduling.tb.js'
import type {
    OrgSchedulingOptions,
    OrgSchedulingResponse,
    Schedule,
    UserAdvancedSchedulingResponse,
    UserSchedulingAdvancedOptions,
    UserSchedulingBasicOptions,
    UserSchedulingResponse,
} from '@/types/scheduling.types.js'
import { errorHandler, type FetchHelper } from '@/utils/fetch.helper.js'
import { omit } from '@/utils/omit.js'

export class SchedulingService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * Get available time slots based on busy data with basic parameters
     * @param userId The ID of the user
     * @param startDate The start date for availability search
     * @param endDate The end date for availability search
     * @param options Scheduling options (all fields optional):
     *   - provider: Calendar provider(s) to check (optional)
     *   - padding: Minutes of padding between slots (optional)
     *   - slotDuration: Duration of each slot in minutes (optional)
     *   - earliestTimeEachDay: Earliest time each day (HH:mm format) (optional)
     *   - latestTimeEachDay: Latest time each day (HH:mm format) (optional)
     *   - timeZone: Time zone for the request (optional)
     *   - maxOverlaps: Maximum number of overlaps allowed (optional)
     * @returns Available time slots with basic scheduling options
     */
    public async user(
        userId: string,
        startDate: Date,
        endDate: Date,
        options: UserSchedulingBasicOptions
    ): Promise<UserSchedulingResponse> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/scheduling`, {
                schema: userSchedulingResponseSchema,
                searchParams: {
                    ...omit(options, ['timeZone']),
                    startDate,
                    endDate,
                },
                headers: options.timeZone ? { 'x-timezone': options.timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(options.provider) ? options.provider.join(',') : options.provider || 'unknown'
                        ),
                        errorInclFilter: 'User has no connected calendars',
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }

    /**
     * Get available time slots based on busy data with advanced parameters
     * @param userId The ID of the user
     * @param schedules Array of schedule rules defining availability windows
     * @param startDate The start date for availability search
     * @param endDate The end date for availability search
     * @param options Advanced scheduling options (all fields optional):
     *   - provider: Calendar provider(s) to check (optional)
     *   - padding: Minutes of padding between slots (optional)
     *   - slotDuration: Duration of each slot in minutes (optional)
     *   - timeZone: Time zone for the request (optional)
     *   - maxOverlaps: Maximum number of overlaps allowed (optional)
     * @returns Available time slots with advanced scheduling options
     */
    public async userAdvanced(
        userId: string,
        schedules: Schedule[],
        startDate: Date,
        endDate: Date,
        options: UserSchedulingAdvancedOptions
    ): Promise<UserAdvancedSchedulingResponse> {
        return this.fetchHelper
            .post(`/v1/users/${userId}/scheduling`, {
                schema: userAdvancedSchedulingResponseSchema,
                searchParams: {
                    ...omit(options, ['timeZone']),
                    startDate,
                    endDate,
                },
                body: { schedules },
                headers: options.timeZone ? { 'x-timezone': options.timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(options.provider) ? options.provider.join(',') : options.provider || 'unknown'
                        ),
                        errorInclFilter: 'User has no connected calendars',
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }

    /**
     * Get available time slots based on busy data for an organization
     * @param orgSlug The slug of the organization
     * @param startDate The start date for availability search
     * @param endDate The end date for availability search
     * @param options Organization scheduling options (all fields optional):
     *   - provider: Calendar provider(s) to check (optional)
     *   - padding: Minutes of padding between slots (optional)
     *   - slotDuration: Duration of each slot in minutes (optional)
     *   - earliestTimeEachDay: Earliest time each day (HH:mm format) (optional)
     *   - latestTimeEachDay: Latest time each day (HH:mm format) (optional)
     *   - timeZone: Time zone for the request (optional)
     *   - maxOverlaps: Maximum number of overlaps allowed (optional)
     * @returns Available time slots for the organization
     */
    public async organization(
        orgSlug: string,
        startDate: Date,
        endDate: Date,
        options: OrgSchedulingOptions
    ): Promise<OrgSchedulingResponse> {
        return this.fetchHelper
            .get(`/v1/organizations/${orgSlug}/scheduling`, {
                schema: orgSchedulingResponseSchema,
                searchParams: {
                    ...omit(options, ['timeZone']),
                    startDate,
                    endDate,
                },
                headers: options.timeZone ? { 'x-timezone': options.timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
                        errorInclFilter: 'User has no connected calendars',
                        error: new OAuthConnectionNotFoundError(
                            'organization',
                            Array.isArray(options.provider) ? options.provider.join(',') : options.provider || 'unknown'
                        ),
                    },
                    {
                        code: 404,
                        errorInclFilter: 'Organization not found',
                        error: new OrganizationNotFoundError(orgSlug),
                    },
                    {
                        code: 404,
                        errorInclFilter: 'No users found in this organization',
                        error: new UserNotFoundError('organization'),
                    },
                ])
            )
    }
}
