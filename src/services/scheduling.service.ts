import { schedulingResponseSchema } from 'src/typebox/scheduling.tb'
import type { Provider } from 'src/types/calendar.types'
import type { SchedulingResponse } from 'src/types/scheduling.types'
import { errorHandler, type FetchHelper } from 'src/utils/fetch.helper'
import { OAuthConnectionNotFoundError, UserNotFoundError } from '../errors'

export class SchedulingService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * Get available time slots based on free-busy data with basic parameters
     * @param userId The ID of the user
     * @param options Scheduling options with basic parameters
     * @param timeZone The time zone for the request (optional)
     * @returns Available time slots with basic scheduling options
     */
    public async userSchedulingBasic(
        userId: string,
        provider: Provider | Provider[],
        padding: number,
        slotDuration: number,
        startDate: Date,
        endDate: Date,
        timeZone?: string,
        earliestTimeEachDay?: string,
        latestTimeEachDay?: string
    ): Promise<SchedulingResponse> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/scheduling`, {
                schema: schedulingResponseSchema,
                searchParams: {
                    provider: provider,
                    padding: padding,
                    slotDuration: slotDuration,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    earliestTimeEachDay: earliestTimeEachDay,
                    latestTimeEachDay: latestTimeEachDay,
                },
                headers: timeZone ? { 'x-timezone': timeZone } : undefined,
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
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
     * @param options Advanced scheduling options
     * @param schedules Array of schedule objects defining availability windows
     * @param timeZone The time zone for the request (optional)
     * @returns Available time slots with advanced scheduling options
     */
    public async userSchedulingAdvanced(
        userId: string,
        provider: Provider | Provider[],
        padding: number,
        slotDuration: number,
        startDate: Date,
        endDate: Date,
        timeZone?: string,
        schedules: TimeRangeWithUser[]
    ): Promise<SchedulingResponse> {
        return this.fetchHelper
            .post(`/v1/users/${userId}/scheduling`, {
                schema: schedulingResponseSchema,
                searchParams: {
                    provider: provider,
                    padding: padding,
                    slotDuration: slotDuration,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
                body: { schedules: schedules },
            })
            .catch(
                errorHandler([
                    {
                        code: 400,
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
