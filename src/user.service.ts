import type { InternRecalOptions } from './types'
import type { User } from './user'
import { FetchHelper } from './utils/fetch.helper'

interface UserOptions {
    includeOrgs: boolean
    includeOAuth: boolean
}

export class UserService {
    private fetchHelper: FetchHelper
    constructor({ token, baseURL: url }: InternRecalOptions) {
        this.fetchHelper = new FetchHelper({ token, url })
    }

    public list({ includeOrgs = false, includeOAuth = false }: UserOptions): User[] {
        this.fetchHelper.fetch('/v1/users', userSchema)
    }

    public get(id: string, { includeOrgs = false, includeOAuth = false }: UserOptions): User | undefined {
        return undefined
    }

    create(): User {
        throw new Error('Not Build yet')
    }
}
