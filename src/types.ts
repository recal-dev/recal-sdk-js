/**
 * Simplified type exports for better developer experience
 *
 * These types are re-exported from the HeyAPI generated types
 * for easier access and better discoverability.
 */

export type {
    /**
     * OAuth connection details
     */
    AuthConnection,
    /**
     * Calendar entity
     */
    Calendar,
    /**
     * Create event payload
     */
    CreateEvent,
    /**
     * Create event across calendars payload
     */
    CreateEventAcrossCalendars,
    DeleteV1OrganizationsOrgSlugData,
    DeleteV1OrganizationsOrgSlugResponse,
    DeleteV1UsersUserIdCalendarEventsMetaMetaIdData,
    DeleteV1UsersUserIdCalendarEventsMetaMetaIdResponse,
    DeleteV1UsersUserIdData,
    DeleteV1UsersUserIdResponse,
    /**
     * Event entity
     */
    Event,
    // Organizations
    GetV1OrganizationsOrgSlugData,
    GetV1OrganizationsOrgSlugResponse,
    GetV1OrganizationsOrgSlugSchedulingData,
    GetV1OrganizationsOrgSlugSchedulingResponse,
    // Organizations
    GetV1OrganizationsResponse,
    // ==================== Common Response Types ====================

    // Users
    GetV1UsersResponse,
    GetV1UsersUserIdCalendarBusyData,
    GetV1UsersUserIdCalendarBusyResponse,
    // Calendars
    GetV1UsersUserIdCalendarData,
    GetV1UsersUserIdCalendarEventsData,
    GetV1UsersUserIdCalendarEventsMetaMetaIdData,
    GetV1UsersUserIdCalendarEventsMetaMetaIdResponse,
    GetV1UsersUserIdCalendarEventsResponse,
    // Calendars
    GetV1UsersUserIdCalendarResponse,
    // ==================== Common Request Types ====================

    // Users
    GetV1UsersUserIdData,
    // OAuth
    GetV1UsersUserIdOauthData,
    GetV1UsersUserIdOauthLinksData,
    GetV1UsersUserIdOauthLinksResponse,
    GetV1UsersUserIdOauthProviderLinkData,
    GetV1UsersUserIdOauthProviderLinkResponse,
    GetV1UsersUserIdOauthProviderTokenData,
    GetV1UsersUserIdOauthProviderTokenResponse,
    // OAuth
    GetV1UsersUserIdOauthResponse,
    GetV1UsersUserIdResponse,
    // Scheduling
    GetV1UsersUserIdSchedulingData,
    // Scheduling
    GetV1UsersUserIdSchedulingResponse,
    /**
     * Organization entity
     */
    Organization,
    PostV1OrganizationsData,
    PostV1OrganizationsResponse,
    PostV1UsersData,
    PostV1UsersOauthProviderVerifyData,
    PostV1UsersResponse,
    PostV1UsersSchedulingData,
    PostV1UsersSchedulingResponse,
    // Events
    PostV1UsersUserIdCalendarEventsMetaData,
    // Events
    PostV1UsersUserIdCalendarEventsMetaResponse,
    PostV1UsersUserIdOauthProviderData,
    PostV1UsersUserIdOauthProviderResponse,
    PostV1UsersUserIdSchedulingData,
    PostV1UsersUserIdSchedulingResponse,
    PutV1OrganizationsOrgSlugData,
    PutV1OrganizationsOrgSlugResponse,
    PutV1UsersUserIdCalendarEventsMetaMetaIdData,
    PutV1UsersUserIdCalendarEventsMetaMetaIdResponse,
    PutV1UsersUserIdData,
    PutV1UsersUserIdResponse,
    /**
     * Time range with start and end dates
     */
    TimeRange,
    /**
     * Update event payload
     */
    UpdateEvent,
    // ==================== Domain Models ====================

    /**
     * User entity
     */
    User,
} from './client/types.gen'

/**
 * Provider type - Google or Microsoft
 */
export type Provider = 'google' | 'microsoft'

/**
 * Calendar access roles
 */
export type CalendarAccessRole = 'freeBusyReader' | 'owner' | 'reader' | 'writer'

/**
 * Days of the week
 */
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

/**
 * OAuth access type
 */
export type OAuthAccessType = 'online' | 'offline'

/**
 * OAuth scope presets
 */
export type OAuthScope = 'edit' | 'free-busy'

/**
 * Attendee response status
 */
export type AttendeeResponseStatus = 'accepted' | 'declined' | 'needsAction' | 'tentative'
