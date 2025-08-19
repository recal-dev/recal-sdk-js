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
    startDate: Date
    endDate: Date
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
}

export interface TimeRangeWithUser extends TimeRange {
    userId: string
}

export interface SchedulingResponse {
    availableSlots: TimeRange[]
    options: OutputsSchedulingOptions
}

export interface SubOrgSchedulingResponse {
    availableSlots: TimeRangeWithUser[]
    options: OutputsSchedulingOptions
}
