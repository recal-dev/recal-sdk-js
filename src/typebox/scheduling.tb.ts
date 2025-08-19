import { Type as T } from '@sinclair/typebox'
import { time } from 'src/utils/time'
import { tzDate } from 'src/utils/tzDate'
import { timeRangeSchema } from './calendar.tb'

/**
 * Schema for scheduling options
 */
// export const schedulingOptionsSchema = T.Object({
//     padding: T.Number({
//         default: 0,
//         description: 'Padding in minutes to add before and after busy times',
//     }),
//     slotDuration: T.Number({
//         default: 30,
//         description: 'Duration of each slot in minutes',
//     }),
//     startDate: T.Date({
//         description: 'Start of the time range to scan for availability (inclusive)',
//     }),
//     endDate: T.Date({
//         description: 'End of the time range to scan for availability (inclusive)',
//     }),
//     earliestTimeEachDay: T.Optional(
//         time({
//             description: 'Requested earliest time of each day (in the time zone of the request) (e.g., 10:00)',
//         })
//     ),
//     latestTimeEachDay: T.Optional(
//         time({
//             description: 'Requested latest time of each day (in the time zone of the request) (e.g., 16:00)',
//         })
//     ),
// })

/**
 * Schema for scheduling options
 */
export const outputSchedulingOptionsSchema = T.Object({
    padding: T.Number({
        default: 0,
        description: 'Padding in minutes to add before and after busy times',
    }),
    slotDuration: T.Number({
        default: 30,
        description: 'Duration of each slot in minutes',
    }),
    startDate: tzDate({
        description: 'Start of the time range to scan for availability (inclusive)',
    }),
    endDate: tzDate({
        description: 'End of the time range to scan for availability (inclusive)',
    }),
    earliestTimeEachDay: T.Optional(
        time({
            description: 'Requested earliest time of each day (in the time zone of the request) (e.g., 10:00)',
        })
    ),
    latestTimeEachDay: T.Optional(
        time({
            description: 'Requested latest time of each day (in the time zone of the request) (e.g., 16:00)',
        })
    ),
})

/**
 * Schema for schedule
 */
export const scheduleSchema = T.Object({
    start: T.Number({
        description: 'Start time in minutes from midnight',
    }),
    end: T.Number({
        description: 'End time in minutes from midnight',
    }),
    daysOfWeek: T.Array(
        T.Number({
            minimum: 0,
            maximum: 6,
            description: 'Days of the week (0 = Sunday, 6 = Saturday)',
        })
    ),
})

/**
 * Schema for time range with user information
 */
export const timeRangeWithUserSchema = T.Object({
    start: tzDate({
        description: 'Start time of the time range in ISO format',
    }),
    end: tzDate({
        description: 'End time of the time range in ISO format',
    }),
    userId: T.String(),
})

/**
 * Schema for the response of the scheduling endpoint
 */
export const schedulingResponseSchema = T.Object({
    availableSlots: T.Array(timeRangeSchema),
    options: outputSchedulingOptionsSchema,
})

/**
 * Schema for the response of the advanced scheduling endpoint
 */
export const advancedSchedulingResponseSchema = T.Object({
    availableSlots: T.Array(timeRangeSchema),
    options: T.Intersect([
        T.Omit(outputSchedulingOptionsSchema, ['earliestTimeEachDay', 'latestTimeEachDay']),
        T.Object({
            schedules: T.Array(scheduleSchema),
        }),
    ]),
})

/**
 * Schema for the response of the sub-organization scheduling endpoint
 */
export const subOrgSchedulingResponseSchema = T.Object({
    availableSlots: T.Array(timeRangeWithUserSchema),
    options: outputSchedulingOptionsSchema,
})
