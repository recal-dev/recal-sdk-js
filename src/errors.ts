export class UserNotFoundError extends Error {
    public constructor(userId: string) {
        super(`User ${userId} not found`)
    }
}

export class ProviderCredentialsNotSetError extends Error {
    public constructor(provider: string) {
        super(`Provider ${provider} credentials not set`)
    }
}

export class OAuthConnectionNotFoundError extends Error {
    public constructor(userId: string, provider: string) {
        super(`OAuth connection not found for user ${userId} and provider ${provider}`)
    }
}
