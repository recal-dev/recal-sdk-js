export interface TestConfig {
    url: string
    ignoreCleanupErrors: boolean
}

export const testConfig: TestConfig = {
    url: process.env.RECAL_URL || '',
    ignoreCleanupErrors: true,
}

export const validateTestConfig = (): void => {
    if (!testConfig.url) {
        throw new Error('RECAL_URL environment variable is not set')
    }
    if (!process.env.RECAL_TOKEN) {
        throw new Error('RECAL_TOKEN environment variable is not set')
    }
}
