import { RecalClient } from '@/recal'
import { testConfig, validateTestConfig } from '../config/test-config'

export class TestClient {
    protected sdk!: RecalClient

    public get client(): RecalClient {
        return this.sdk
    }

    public generateTestId(prefix: string, kind: string): string {
        return `${prefix}_${kind}_${crypto.randomUUID()}`
    }

    async setup(): Promise<void> {
        validateTestConfig()

        this.sdk = new RecalClient({
            url: testConfig.url,
            token: testConfig.token,
        })
    }

    async teardown(prefix: string): Promise<void> {
        // Clean up organizations
        try {
            const orgs = await this.sdk.organizations.list()

            for (const org of orgs) {
                if (org.name?.startsWith(prefix) || org.slug?.startsWith(prefix)) {
                    try {
                        await this.sdk.organizations.delete(org.slug)
                    } catch (err) {
                        console.warn(`Failed to delete org ${org.slug}:`, err)
                    }
                }
            }
        } catch (err) {
            console.warn('Failed to list organizations during teardown:', err)
        }

        // Clean up users
        try {
            const users = await this.sdk.users.list()

            for (const user of users) {
                if (user.id.startsWith(prefix)) {
                    try {
                        await this.sdk.users.delete(user.id)
                    } catch (err) {
                        console.warn(`Failed to delete user ${user.id}:`, err)
                    }
                }
            }
        } catch (err) {
            console.warn('Failed to list users during teardown:', err)
        }
    }
}
