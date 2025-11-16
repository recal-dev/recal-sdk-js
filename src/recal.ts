import { createClient, createConfig } from './client/client'
import type { ClientOptions } from './client/types.gen'
import { CalendarService } from './services/calendar.service'
import { EventsService } from './services/events.service'
import { OAuthService } from './services/oauth.service'
import { OrganizationsService } from './services/organizations.service'
import { SchedulingService } from './services/scheduling.service'
import { UsersService } from './services/users.service'
import { functionize } from './utils/functionize'

/**
 * Recal SDK Options
 */
export interface RecalOptions {
    /**
     * API token for authentication (must start with "recal_")
     * Can be a string or a function that returns a string
     */
    token?: string | (() => string)

    /**
     * Base URL for the API
     * Can be a string or a function that returns a string
     * @default "https://api.recal.dev"
     */
    url?: string | (() => string)
}

/**
 * Recal SDK Client
 *
 * Provides a type-safe, validated interface to the Recal API.
 * All functions are auto-generated from the OpenAPI spec with runtime validation.
 *
 * @example
 * ```typescript
 * import { Recal } from 'recal-sdk'
 *
 * const recal = new Recal({ token: 'recal_...' }) // or RECAL_TOKEN in env
 *
 * // Use clean service-based API
 * const user = await recal.users.get('user-123', {
 *   include: ['organizations', 'oauthConnections']
 * })
 *
 * const calendars = await recal.calendar.list('user-123', {
 *   provider: 'google'
 * })
 *
 * const event = await recal.events.create('user-123', {
 *   subject: 'Team Meeting',
 *   start: '2024-01-15T10:00:00Z',
 *   end: '2024-01-15T11:00:00Z',
 *   attendees: [{ email: 'team@example.com' }],
 *   meeting: true
 * })
 * ```
 */
export class Recal {
    private client: ReturnType<typeof createClient>

    // Services
    public readonly users: UsersService
    public readonly organizations: OrganizationsService
    public readonly calendar: CalendarService
    public readonly events: EventsService
    public readonly oauth: OAuthService
    public readonly scheduling: SchedulingService

    constructor(options?: RecalOptions) {
        // Guard process.env for non-Node runtimes
        const env =
            typeof process !== 'undefined' && typeof process.env !== 'undefined'
                ? (process.env as Record<string, string | undefined>)
                : {}

        const token = functionize(options?.token) || env.RECAL_TOKEN || ''
        const baseUrl = functionize(options?.url) || env.RECAL_URL || 'https://api.recal.dev'

        // Validate token
        if (!token) {
            console.error('[Recal] No token provided')
        } else if (!token.startsWith('recal_')) {
            console.error('[Recal] Invalid token, must start with "recal_"')
        }

        // Create configured client
        this.client = createClient(
            createConfig<ClientOptions>({
                baseUrl,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        )

        // Initialize services
        this.users = new UsersService(this.client)
        this.organizations = new OrganizationsService(this.client)
        this.calendar = new CalendarService(this.client)
        this.events = new EventsService(this.client)
        this.oauth = new OAuthService(this.client)
        this.scheduling = new SchedulingService(this.client)
    }
}

// Export the legacy RecalClient name for backwards compatibility
export { Recal as RecalClient }
