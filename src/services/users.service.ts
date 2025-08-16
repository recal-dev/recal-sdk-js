import { Type as T } from '@sinclair/typebox'
import { includesHelper } from 'src/utils/includes.helper'
import { User } from '../entities/user'
import { userSchema } from '../typebox/user.tb'
import { errorHandler, FetchError, type FetchHelper } from '../utils/fetch.helper'

interface UserOptions {
    includeOrgs: boolean
    includeOAuth: boolean
}

export class UsersService {
    constructor(private fetchHelper: FetchHelper) {}

    public async listAll(): Promise<User[]> {
        const users = await this.fetchHelper.get('/v1/users', { schema: T.Array(userSchema) })
        return users.map((user) => User.fromJson(user))
    }

    public async get(id: string, { includeOrgs = false, includeOAuth = false }: UserOptions): Promise<User | null> {
        const newUser = await this.fetchHelper
            .get(`/v1/users/${id}`, {
                schema: userSchema,
                searchParams: {
                    ...includesHelper([
                        [includeOrgs, 'organizations'],
                        [includeOAuth, 'oauthConnections'],
                    ]),
                },
            })
            .catch(errorHandler([[404, () => null]]))
        return newUser ? User.fromJson(newUser) : null
    }

    public async create(id: string, organizationSlugs?: string[]): Promise<User> {
        const newUser = await this.fetchHelper.post(`/v1/users`, {
            body: { id, organizationSlugs },
            schema: userSchema,
        })
        return User.fromJson(newUser)
    }
}
