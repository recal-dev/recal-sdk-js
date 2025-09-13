import type { Static } from '@sinclair/typebox'
import type {
    advancedSchedulingResponseSchema,
    schedulingResponseSchema,
    schedulingSchema,
    subOrgSchedulingResponseSchema,
} from '@/typebox/scheduling.tb.js'
import type { Provider, TimeRange } from './calendar.types.js'

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
// MARK: Scheduling Options
// ==========================================

export interface UserSchedulingBasicOptions {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
    timeZone?: string
    maxOverlaps?: number
}

export interface UserSchedulingAdvancedOptions {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    timeZone?: string
    maxOverlaps?: number
}

export interface OrgSchedulingOptions {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    earliestTimeEachDay?: string
    latestTimeEachDay?: string
    timeZone?: string
    maxOverlaps?: number
}
