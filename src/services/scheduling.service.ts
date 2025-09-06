import {
    advancedSchedulingResponseSchema,
    schedulingResponseSchema,
    subOrgSchedulingResponseSchema,
} from 'src/typebox/scheduling.tb'
import type {
    AdvancedSchedulingResponse,
    OrgSchedulingParams,
    Schedule,
    SchedulingResponse,
    SubOrgSchedulingResponse,
    UserSchedulingAdvancedParams,
    UserSchedulingBasicParams,
} from 'src/types/scheduling.types'
import { errorHandler, type FetchHelper } from 'src/utils/fetch.helper'
import { omit } from 'src/utils/omit'
import { OAuthConnectionNotFoundError, OrganizationNotFoundError, UserNotFoundError } from '../errors'

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
     * @returns Available time slots with basic scheduling options
     */
    public async userSchedulingBasic(
        userId: string,
        startDate: Date,
        endDate: Date,
        options: UserSchedulingBasicParams
    ): Promise<SchedulingResponse> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/scheduling`, {
                schema: schedulingResponseSchema,
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
                        statusTextInclFilter: 'User has no connected calendars',
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
     * @returns Available time slots with advanced scheduling options
     */
    public async userSchedulingAdvanced(
        userId: string,
        schedules: Schedule[],
        startDate: Date,
        endDate: Date,
        options: UserSchedulingAdvancedParams
    ): Promise<AdvancedSchedulingResponse> {
        return this.fetchHelper
            .post(`/v1/users/${userId}/scheduling`, {
                schema: advancedSchedulingResponseSchema,
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
                        statusTextInclFilter: 'User has no connected calendars',
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
     * @returns Available time slots for the organization
     */
    public async getOrgWideAvailability(
        orgSlug: string,
        startDate: Date,
        endDate: Date,
        options: OrgSchedulingParams
    ): Promise<SubOrgSchedulingResponse> {
        return this.fetchHelper
            .get(`/v1/organizations/${orgSlug}/scheduling`, {
                schema: subOrgSchedulingResponseSchema,
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
                        statusTextInclFilter: 'User has no connected calendars',
                        error: new OAuthConnectionNotFoundError(
                            'organization',
                            Array.isArray(options.provider) ? options.provider.join(',') : options.provider || 'unknown'
                        ),
                    },
                    {
                        code: 404,
                        statusTextInclFilter: 'Organization not found',
                        error: new OrganizationNotFoundError(orgSlug),
                    },
                    {
                        code: 404,
                        statusTextInclFilter: 'No users found in this organization',
                        error: new UserNotFoundError('organization'),
                    },
                ])
            )
    }
}
