export interface TestConfig {
    url: string
    token: string
    ignoreCleanupErrors: boolean
    maxRetryAttempts: number
    timeout: number
}

export const testConfig: TestConfig = {
    url: process.env.RECAL_URL || 'https://api.staging.recal.dev',
    token: process.env.RECAL_TOKEN || '',
    ignoreCleanupErrors: true,
    maxRetryAttempts: 3,
    timeout: 30000,
}

export const validateTestConfig = (): void => {
    if (!testConfig.url) {
        throw new Error('RECAL_URL environment variable is not set')
    }
    if (!testConfig.token) {
        throw new Error('RECAL_TOKEN environment variable is not set')
    }
}
