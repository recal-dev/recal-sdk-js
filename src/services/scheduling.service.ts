import { advancedSchedulingResponseSchema, schedulingResponseSchema } from 'src/typebox/scheduling.tb'
import type { Provider } from 'src/types/calendar.types'
import type { AdvancedSchedulingResponse, Schedule, SchedulingResponse } from 'src/types/scheduling.types'
import { errorHandler, type FetchHelper } from 'src/utils/fetch.helper'
import { OAuthConnectionNotFoundError, UserNotFoundError } from '../errors'

export class SchedulingService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * Get available time slots based on free-busy data with basic parameters
     * @param userId The ID of the user
     * @param provider The provider of the user
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
        provider?: Provider | Provider[],
        padding?: number,
        slotDuration?: number,
        startDate?: Date,
        endDate?: Date,
        earliestTimeEachDay?: string,
        latestTimeEachDay?: string,
        timeZone?: string
    ): Promise<SchedulingResponse> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/scheduling`, {
                schema: schedulingResponseSchema,
                searchParams: {
                    provider,
                    padding,
                    slotDuration,
                    startDate,
                    endDate,
                    earliestTimeEachDay,
                    latestTimeEachDay,
                },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
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
     * @param provider The provider of the user
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
        provider?: Provider | Provider[],
        padding?: number,
        slotDuration?: number,
        startDate?: Date,
        endDate?: Date,
        timeZone?: string
    ): Promise<AdvancedSchedulingResponse> {
        return this.fetchHelper
            .post(`/v1/users/${userId}/scheduling`, {
                schema: advancedSchedulingResponseSchema,
                searchParams: {
                    provider,
                    padding,
                    slotDuration,
                    startDate,
                    endDate,
                },
                body: { schedules },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 404,
                        error: new OAuthConnectionNotFoundError(
                            userId,
                            Array.isArray(provider) ? provider.join(',') : provider || 'unknown'
                        ),
                        statusTextInclFilter: 'User has no connected calendars',
                    },
                    { code: 404, error: new UserNotFoundError(userId) },
                ])
            )
    }
}
