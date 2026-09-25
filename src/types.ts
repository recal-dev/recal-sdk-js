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
    CreateMetaEvent,
    DeleteV1OrganizationsByOrgSlugData,
    DeleteV1OrganizationsByOrgSlugResponse,
    DeleteV1UsersByUserIdCalendarEventsMetaByMetaIdData,
    DeleteV1UsersByUserIdCalendarEventsMetaByMetaIdResponses,
    DeleteV1UsersByUserIdData,
    DeleteV1UsersByUserIdResponse,
    /**
     * Event entity
     */
    Event,
    /**
     * A calendar that could not be read, with the reason and a message for the end user
     */
    FailedCalendar,
    /**
     * A user whose busy times are missing (`failedCalendars` empty) or incomplete
     * (`failedCalendars` names the gaps)
     */
    FailedFreeBusyUser,
    /**
     * Why a calendar or a user could not be read. A closed union — a code is never
     * renamed or removed once shipped: https://docs.recal.dev/core/troubleshooting
     */
    FreeBusyFailureReason,
    GetV1OrganizationsByOrgSlugData,
    GetV1OrganizationsByOrgSlugResponse,
    GetV1OrganizationsByOrgSlugSchedulingData,
    GetV1OrganizationsByOrgSlugSchedulingResponse,
    GetV1OrganizationsResponse,
    GetV1UsersByUserIdCalendarBusyData,
    GetV1UsersByUserIdCalendarBusyResponse,
    GetV1UsersByUserIdCalendarData,
    GetV1UsersByUserIdCalendarEventsData,
    GetV1UsersByUserIdCalendarEventsMetaByMetaIdData,
    GetV1UsersByUserIdCalendarEventsMetaByMetaIdResponse,
    GetV1UsersByUserIdCalendarEventsResponse,
    GetV1UsersByUserIdCalendarResponse,
    GetV1UsersByUserIdData,
    GetV1UsersByUserIdOauthByProviderLinkData,
    GetV1UsersByUserIdOauthByProviderLinkResponse,
    GetV1UsersByUserIdOauthByProviderTokenData,
    GetV1UsersByUserIdOauthByProviderTokenResponse,
    GetV1UsersByUserIdOauthData,
    GetV1UsersByUserIdOauthLinksData,
    GetV1UsersByUserIdOauthLinksResponse,
    GetV1UsersByUserIdOauthResponse,
    GetV1UsersByUserIdResponse,
    GetV1UsersByUserIdSchedulingData,
    GetV1UsersByUserIdSchedulingResponse,
    GetV1UsersResponse,
    /**
     * Organization entity
     */
    Organization,
    PostV1OrganizationsData,
    PostV1OrganizationsResponse,
    PostV1UsersByUserIdCalendarEventsMetaData,
    PostV1UsersByUserIdCalendarEventsMetaResponse,
    PostV1UsersByUserIdOauthByProviderData,
    PostV1UsersByUserIdOauthByProviderResponse,
    PostV1UsersByUserIdSchedulingData,
    PostV1UsersByUserIdSchedulingResponse,
    PostV1UsersData,
    PostV1UsersOauthByProviderVerifyData,
    PostV1UsersResponse,
    PostV1UsersSchedulingData,
    PostV1UsersSchedulingResponse,
    PutV1OrganizationsByOrgSlugData,
    PutV1OrganizationsByOrgSlugResponse,
    PutV1UsersByUserIdCalendarEventsMetaByMetaIdData,
    PutV1UsersByUserIdCalendarEventsMetaByMetaIdResponse,
    PutV1UsersByUserIdData,
    PutV1UsersByUserIdResponse,
    /**
     * Time range with start and end dates
     */
    TimeRange,
    /**
     * Update event payload
     */
    UpdateEvent,
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
