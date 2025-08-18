export class OrganizationNotFoundError extends Error {
    public constructor(slug: string) {
        super(`[Recal] Organization ${slug} not found`)
    }
}

export class UserAlreadyExistsError extends Error {
    public constructor(userId: string) {
        super(`[Recal] User ${userId} already exists`)
    }
}

export class UserNotFoundError extends Error {
    public constructor(userId: string) {
        super(`[Recal] User ${userId} not found`)
    }
}

export class ProviderCredentialsNotSetError extends Error {
    public constructor(provider: string) {
        super(`[Recal] Provider ${provider} credentials not set`)
    }
}

export class OAuthConnectionNotFoundError extends Error {
    public constructor(userId: string, provider: string) {
        super(`[Recal] OAuth connection not found for user ${userId} and provider ${provider}`)
    }
}
