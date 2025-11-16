import { RecalClient } from '@/recal'
import { testConfig, validateTestConfig } from '../config/test-config'

export class TestClient {
    protected sdk!: RecalClient
    private createdEventMetaIds: Map<string, string[]> = new Map() // userId -> metaIds

    public get client(): RecalClient {
        return this.sdk
    }

    public generateTestId(prefix: string, kind: string): string {
        return `${prefix}_${kind}_${crypto.randomUUID()}`
    }

    public trackEventMetaId(userId: string, metaId: string): void {
        const existing = this.createdEventMetaIds.get(userId) || []
        existing.push(metaId)
        this.createdEventMetaIds.set(userId, existing)
    }

    /**
     * Create OAuth connection directly with tokens from environment (for testing)
     * This uses the refresh token to create a valid OAuth connection
     *
     * NOTE: This requires the platform to have OAuth credentials configured in the Dashboard.
     * If OAuth is not configured at the platform level, this will fail gracefully.
     *
     * @returns true if OAuth was set up successfully, false otherwise
     */
    async setupOAuthForUser(
        userId: string,
        provider: 'google' | 'microsoft' = 'google'
    ): Promise<boolean> {
        if (!process.env.GOOGLE_REFRESH_TOKEN) {
            console.warn('OAuth tokens not found in environment, skipping OAuth setup')
            return false
        }

        try {
            // Create OAuth connection with tokens from environment
            // Even if access token is expired, having refresh token allows SDK to refresh it
            await this.sdk.oauth.create(userId, provider, {
                accessToken: process.env.GOOGLE_ACCESS_TOKEN || 'expired',
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                email: null,
                expiresAt: null,
                scope: ['https://www.googleapis.com/auth/calendar'],
            })
            return true
        } catch (error: unknown) {
            // Check if error is due to platform OAuth not configured
            const errorMessage =
                typeof error === 'object' && error !== null && 'details' in error
                    ? String((error as { details?: { error?: string } }).details?.error)
                    : ''

            if (errorMessage.includes('OAuth credentials not found for provider')) {
                console.warn(`\n⚠️  Platform OAuth not configured for ${provider}`)
                console.warn('   To run OAuth-dependent tests, configure OAuth credentials in the Recal Dashboard')
                console.warn('   Tests requiring OAuth will be skipped\n')
                return false
            }

            if (testConfig.ignoreCleanupErrors) {
                console.warn(`Failed to create OAuth connection for user ${userId}:`, error)
                return false
            }
            throw error
        }
    }

    async setup(): Promise<void> {
        validateTestConfig()

        this.sdk = new RecalClient({
            url: testConfig.url,
        })
    }

    async teardown(prefix: string): Promise<void> {
        // Clean up tracked events by metaId
        for (const [userId, metaIds] of this.createdEventMetaIds.entries()) {
            for (const metaId of metaIds) {
                try {
                    await this.sdk.events.delete(userId, metaId)
                } catch (err) {
                    if (testConfig.ignoreCleanupErrors) {
                        console.warn(`Failed to delete event ${metaId}:`, err)
                    }
                }
            }
        }
        this.createdEventMetaIds.clear()

        // Clean up organizations
        try {
            const orgs = await this.sdk.organizations.list()

            for (const org of orgs) {
                if (org.name?.startsWith(prefix) || org.slug?.startsWith(prefix)) {
                    try {
                        await this.sdk.organizations.delete(org.slug)
                    } catch (err) {
                        if (testConfig.ignoreCleanupErrors) {
                            console.warn(`Failed to delete org ${org.slug}:`, err)
                        }
                    }
                }
            }
        } catch (err) {
            if (testConfig.ignoreCleanupErrors) {
                console.warn('Failed to list organizations during teardown:', err)
            }
        }

        // Clean up users (this will also clean up their OAuth connections and calendars)
        try {
            const users = await this.sdk.users.list()

            for (const user of users) {
                if (user.id.startsWith(prefix)) {
                    try {
                        await this.sdk.users.delete(user.id)
                    } catch (err) {
                        if (testConfig.ignoreCleanupErrors) {
                            console.warn(`Failed to delete user ${user.id}:`, err)
                        }
                    }
                }
            }
        } catch (err) {
            if (testConfig.ignoreCleanupErrors) {
                console.warn('Failed to list users during teardown:', err)
            }
        }
    }
}
