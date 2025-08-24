import { CalendarService } from './services/calendar.service'
import { OAuthService } from './services/oauth.service'
import { OrganizationsService } from './services/organizations.service'
import { SchedulingService } from './services/scheduling.service'
import { UsersService } from './services/users.service'
import type { RecalOptions } from './types/internal.types'
import { FetchHelper } from './utils/fetch.helper'
import { functionize } from './utils/functionize'

/**
 * Recal SDK
 * @description Recal SDK for Node.js
 * @version 0.1.0
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

    public constructor(options: RecalOptions) {
        const _token = functionize(options.token) || process.env.RECAL_TOKEN
        this.baseUrl = functionize(options.url) || process.env.RECAL_URL || 'https://api.recal.dev'
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
