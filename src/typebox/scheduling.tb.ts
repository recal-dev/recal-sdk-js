import { Type as T } from '@sinclair/typebox'
import { timeRangeSchema } from './calendar.tb'
import { timeString } from './timeString.tb'

const exampleStartDate = new Date('2025-06-04')
const exampleEndDate = new Date('2025-06-10')

/**
 * Schema for scheduling
 */
export const schedulingSchema = T.Object({
    days: T.Array(
        T.Union([
            T.Literal('monday'),
            T.Literal('tuesday'),
            T.Literal('wednesday'),
            T.Literal('thursday'),
            T.Literal('friday'),
            T.Literal('saturday'),
            T.Literal('sunday'),
        ]),
        { description: 'The days to apply this scheduling element to' }
    ),
    start: timeString({
        description: 'Start time in minutes from midnight',
    }),
    end: timeString({
        description: 'End time in minutes from midnight',
    }),
})

/**
 * Schema for scheduling options
 */
export const schedulingOptionsSchema = T.Object({
    padding: T.Number({
        default: 0,
        description: 'Padding in minutes to add before and after busy times',
    }),
    slotDuration: T.Number({
        default: 30,
        description: 'Duration of each slot in minutes',
    }),
    startDate: T.Date({
        description: 'Start of the time range to scan for availability (inclusive)',
        examples: [exampleStartDate],
    }),
    endDate: T.Date({
        description: 'End of the time range to scan for availability (inclusive)',
        examples: [exampleEndDate],
    }),
    earliestTimeEachDay: T.Optional(
        timeString({
            description: 'Requested earliest time of each day (in the time zone of the request) (e.g., 10:00)',
        })
    ),
    latestTimeEachDay: T.Optional(
        timeString({
            description: 'Requested latest time of each day (in the time zone of the request) (e.g., 16:00)',
        })
    ),
})

/**
 * Schema for output scheduling options
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
    startDate: T.Date({
        description: 'Start of the time range to scan for availability (inclusive)',
        examples: [exampleStartDate],
    }),
    endDate: T.Date({
        description: 'End of the time range to scan for availability (inclusive)',
        examples: [exampleEndDate],
    }),
    earliestTimeEachDay: T.Optional(
        timeString({
            description: 'Requested earliest time of each day (in the time zone of the request) (e.g., 10:00)',
        })
    ),
    latestTimeEachDay: T.Optional(
        timeString({
            description: 'Requested latest time of each day (in the time zone of the request) (e.g., 16:00)',
        })
    ),
})

/**
 * Schema for time range with user information
 */
export const timeRangeWithUserSchema = T.Object({
    start: T.Date({
        description: 'Start time of the time range in ISO format',
        examples: [exampleStartDate],
    }),
    end: T.Date({
        description: 'End time of the time range in ISO format',
        examples: [exampleEndDate],
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
    options: T.Object({
        ...T.Omit(schedulingOptionsSchema, ['earliestTimeEachDay', 'latestTimeEachDay']).properties,
        schedules: T.Array(schedulingSchema),
    }),
})

/**
 * Schema for the response of the sub-organization scheduling endpoint
 */
export const subOrgSchedulingResponseSchema = T.Object({
    availableSlots: T.Array(timeRangeWithUserSchema),
    options: outputSchedulingOptionsSchema,
})
