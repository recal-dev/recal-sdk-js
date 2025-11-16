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
