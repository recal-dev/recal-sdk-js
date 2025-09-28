import type { Static } from '@sinclair/typebox'
import type {
    orgSchedulingResponseSchema,
    schedulingSchema,
    userAdvancedSchedulingResponseSchema,
    userBulkSchedulingResponseSchema,
    userSchedulingResponseSchema,
} from '@/typebox/scheduling.tb.js'
import type { Provider, TimeRange } from './calendar.types.js'

// ==========================================
// MARK: Time & Schedule Models
// ==========================================

export interface TimeRangeWithUser extends TimeRange {
    userId: string
}

export type Schedule = Static<typeof schedulingSchema>

export type UserWithSchedules = {
    userId: string
    calendarIds?: string[]
    schedules?: Schedule[]
}

// ==========================================
// MARK: Response Types
// ==========================================

export type UserSchedulingResponse = Static<typeof userSchedulingResponseSchema>

export type UserAdvancedSchedulingResponse = Static<typeof userAdvancedSchedulingResponseSchema>

export type OrgSchedulingResponse = Static<typeof orgSchedulingResponseSchema>

export type UserBulkSchedulingResponse = Static<typeof userBulkSchedulingResponseSchema>

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

export interface UserBulkSchedulingOptions {
    provider?: Provider | Provider[]
    padding?: number
    slotDuration?: number
    timeZone?: string
    maxOverlaps?: number
    users: UserWithSchedules[]
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
