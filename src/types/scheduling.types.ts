import type { Static } from '@sinclair/typebox'
import type { subOrgSchedulingResponseSchema } from '../typebox/scheduling.tb'
import type { TimeRange } from './calendar.types'

export interface SchedulingOptions {
    padding: number
    slotDuration: number
    startDate: Date
    endDate: Date
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
}

export interface OutputsSchedulingOptions {
    padding: number
    slotDuration: number
    startDate: string
    endDate: string
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
}

export interface TimeRangeWithUser extends TimeRange {
    userId: string
}

export interface Schedule {
    start: number
    end: number
    daysOfWeek: number[]
}

export interface SchedulingResponse {
    availableSlots: TimeRange[]
    options: OutputsSchedulingOptions
}

export interface AdvancedSchedulingResponse {
    availableSlots: TimeRange[]
    options: OutputsSchedulingOptions & {
        schedules: Schedule[]
    }
}

export type SubOrgSchedulingResponse = Static<typeof subOrgSchedulingResponseSchema>
