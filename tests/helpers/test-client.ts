import { RecalClient } from '../../src'
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
        const orgs = await this.sdk.organizations.listAll()
        for (const org of orgs) {
            if (org.name?.startsWith(prefix)) {
                await this.sdk.organizations.delete(org.slug)
            }
        }

        const users = await this.sdk.users.listAll()
        for (const user of users) {
            if (user.id.startsWith(prefix)) {
                await this.sdk.users.delete(user.id)
            }
        }
    }
}
