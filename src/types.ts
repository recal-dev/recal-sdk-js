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
    DeleteOrganizationsOrgSlugData,
    DeleteOrganizationsOrgSlugResponse,
    DeleteUsersUserIdCalendarEventsMetaMetaIdData,
    DeleteUsersUserIdCalendarEventsMetaMetaIdResponse,
    DeleteUsersUserIdData,
    DeleteUsersUserIdResponse,
    /**
     * Event entity
     */
    Event,
    // Organizations
    GetOrganizationsOrgSlugData,
    GetOrganizationsOrgSlugResponse,
    GetOrganizationsOrgSlugSchedulingData,
    GetOrganizationsOrgSlugSchedulingResponse,
    // Organizations
    GetOrganizationsResponse,
    // ==================== Common Response Types ====================

    // Users
    GetUsersResponse,
    GetUsersUserIdCalendarBusyData,
    GetUsersUserIdCalendarBusyResponse,
    // Calendars
    GetUsersUserIdCalendarData,
    GetUsersUserIdCalendarEventsData,
    GetUsersUserIdCalendarEventsMetaMetaIdData,
    GetUsersUserIdCalendarEventsMetaMetaIdResponse,
    GetUsersUserIdCalendarEventsResponse,
    // Calendars
    GetUsersUserIdCalendarResponse,
    // ==================== Common Request Types ====================

    // Users
    GetUsersUserIdData,
    // OAuth
    GetUsersUserIdOauthData,
    GetUsersUserIdOauthLinksData,
    GetUsersUserIdOauthLinksResponse,
    GetUsersUserIdOauthProviderLinkData,
    GetUsersUserIdOauthProviderLinkResponse,
    GetUsersUserIdOauthProviderTokenData,
    GetUsersUserIdOauthProviderTokenResponse,
    // OAuth
    GetUsersUserIdOauthResponse,
    GetUsersUserIdResponse,
    // Scheduling
    GetUsersUserIdSchedulingData,
    // Scheduling
    GetUsersUserIdSchedulingResponse,
    /**
     * Organization entity
     */
    Organization,
    PostOrganizationsData,
    PostOrganizationsResponse,
    PostUsersData,
    PostUsersOauthProviderVerifyData,
    PostUsersResponse,
    PostUsersSchedulingData,
    PostUsersSchedulingResponse,
    // Events
    PostUsersUserIdCalendarEventsMetaData,
    // Events
    PostUsersUserIdCalendarEventsMetaResponse,
    PostUsersUserIdOauthProviderData,
    PostUsersUserIdOauthProviderResponse,
    PostUsersUserIdSchedulingData,
    PostUsersUserIdSchedulingResponse,
    PutOrganizationsOrgSlugData,
    PutOrganizationsOrgSlugResponse,
    PutUsersUserIdCalendarEventsMetaMetaIdData,
    PutUsersUserIdCalendarEventsMetaMetaIdResponse,
    PutUsersUserIdData,
    PutUsersUserIdResponse,
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
