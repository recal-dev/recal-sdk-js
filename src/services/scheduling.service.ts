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
     * Get available time slots based on free-busy data with basic parameters
     * @param userId The ID of the user
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param padding The padding for the time slots
     * @param slotDuration The duration of each slot
     * @param startDate The start date
     * @param endDate The end date
     * @param earliestTimeEachDay The earliest time each day
     * @param latestTimeEachDay The latest time each day
     * @param timeZone The time zone for the request
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
     * Get available time slots based on free-busy data with advanced parameters
     * @param userId The ID of the user
     * @param schedules The schedules of the user
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param padding The padding for the time slots
     * @param slotDuration The duration of each slot
     * @param startDate The start date
     * @param endDate The end date
     * @param timeZone The time zone for the request
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
     * Get available time slots based on free-busy data for an organization
     * @param orgSlug The slug of the organization
     * @param provider The provider(s) of the calendar (optional, can be array)
     * @param padding The padding for the time slots
     * @param slotDuration The duration of each slot
     * @param startDate The start date
     * @param endDate The end date
     * @param earliestTimeEachDay The earliest time each day
     * @param latestTimeEachDay The latest time each day
     * @param timeZone The time zone for the request
     * @returns Available time slots with basic scheduling options
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
