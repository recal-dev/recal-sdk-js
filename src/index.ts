import { CalendarService } from './services/calendar.service.js'
import { OAuthService } from './services/oauth.service.js'
import { OrganizationsService } from './services/organizations.service.js'
import { SchedulingService } from './services/scheduling.service.js'
import { UsersService } from './services/users.service.js'
import type { RecalOptions } from './types/internal.types.js'
import { FetchHelper } from './utils/fetch.helper.js'
import { functionize } from './utils/functionize.js'

/**
 * Recal SDK
 * @description Recal SDK for JavaScript/TypeScript
 * @version 0.2.0
 * @author Recal <team@recal.dev>
 * @license MIT
 */
export class RecalClient {
    private token: string
    private baseUrl: string
    private fetchHelper: FetchHelper

    // MARK: Services
    oauth: OAuthService
    organizations: OrganizationsService
    users: UsersService
    calendar: CalendarService
    scheduling: SchedulingService

    public constructor(options?: RecalOptions) {
        // Guard process.env for non-Node runtimes
        const env =
            typeof process !== 'undefined' && typeof process.env !== 'undefined'
                ? (process.env as Record<string, string | undefined>)
                : {}
        const _token = functionize(options?.token) || env.RECAL_TOKEN
        this.baseUrl = functionize(options?.url) || env.RECAL_URL || 'https://api.recal.dev'
        if (!_token) console.error('[Recal] No token provided')
        else if (!_token.startsWith('recal_')) console.error('[Recal] Invalid token, must start with "recal_"')
        this.token = _token || ''
        // Initialize helpers
        this.fetchHelper = new FetchHelper({ token: this.token, url: this.baseUrl })
        // Initialize services
        this.oauth = new OAuthService(this.fetchHelper)
        this.organizations = new OrganizationsService(this.fetchHelper)
        this.users = new UsersService(this.fetchHelper)
        this.calendar = new CalendarService(this.fetchHelper)
        this.scheduling = new SchedulingService(this.fetchHelper)
    }
}

export * from './entities/organization'
export * from './entities/user'
export * from './errors'
// Public types
export * from './types/calendar.types'
export * from './types/scheduling.types'
export * from './types/oauth.types'
export type { RecalOptions } from './types/internal.types'
export type { RecalOptions as RecalClientOptions } from './types/internal.types'
