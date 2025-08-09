import type { Organization } from './organization'
import type { OAuthConnection } from './types/oauth.types'

export class User {
    constructor(
        public id: string,
        public createdAt: Date,
        public organizations?: Organization[],
        public oauthConnections?: OAuthConnection[]
    ) {}

    public getOrganizations(): Organization[] {
        return []
    }

    public getOAuthConnections(): OAuthConnection[] {
        return []
    }
}
