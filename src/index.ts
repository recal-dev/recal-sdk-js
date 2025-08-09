import { OAuthService } from './oauth.service'
import { FetchHelper } from './utils/fetch.helper'
import { type Functionize, functionize } from './utils/functionize'

export interface RecalOptions {
    token?: Functionize<string>
    url?: Functionize<string>
}

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
    oauth: OAuthService

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
    }
}

export * from './errors'
export * from './types'
