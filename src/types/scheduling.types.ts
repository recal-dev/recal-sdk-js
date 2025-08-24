import type { Static } from '@sinclair/typebox'
import type {
    advancedSchedulingResponseSchema,
    schedulingResponseSchema,
    schedulingSchema,
    subOrgSchedulingResponseSchema,
} from '../typebox/scheduling.tb'
import type { Provider, TimeRange } from './calendar.types'

// ==========================================
// MARK: Scheduling Options
// ==========================================

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
    schedules: Schedule[]
}

// ==========================================
// MARK: Time & Schedule Models
// ==========================================

export interface TimeRangeWithUser extends TimeRange {
    userId: string
}

export type Schedule = Static<typeof schedulingSchema>

// ==========================================
// MARK: Response Types
// ==========================================

export type SchedulingResponse = Static<typeof schedulingResponseSchema>

export type AdvancedSchedulingResponse = Static<typeof advancedSchedulingResponseSchema>

export type SubOrgSchedulingResponse = Static<typeof subOrgSchedulingResponseSchema>

// ==========================================
// MARK: Scheduling Params
// ==========================================

export interface UserSchedulingBasicParams {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
    timeZone?: string
}

export interface UserSchedulingAdvancedParams {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    timeZone?: string
}

export interface OrgSchedulingParams {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
    timeZone?: string
}
