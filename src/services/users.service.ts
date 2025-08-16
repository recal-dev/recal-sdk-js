import { Type as T } from '@sinclair/typebox'
import { includesHelper } from 'src/utils/includes.helper'
import { User } from '../entities/user'
import { userSchema } from '../typebox/user.tb'
import { errorHandler, type FetchHelper } from '../utils/fetch.helper'

interface UserOptions {
    includeOrgs: boolean
    includeOAuth: boolean
}

export class UsersService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * List all users
     * @returns An array of users
     */
    public async listAll(): Promise<User[]> {
        const users = await this.fetchHelper.get('/v1/users', { schema: T.Array(userSchema) })
        return users.map((user) => User.fromJson(user))
    }

    /**
     * Get a user by ID
     * @param id The ID of the user
     * @param options Options for the user
     * @returns The user
     */
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

    /**
     * Create a new user
     * @param id The ID of the user
     * @param organizationSlugs The slugs of the organizations the user is a member of
     * @returns The new user
     */
    public async create(id: string, organizationSlugs?: string[]): Promise<User> {
        const newUser = await this.fetchHelper.post(`/v1/users`, {
            body: { id, organizationSlugs },
            schema: userSchema,
        })
        return User.fromJson(newUser)
    }
}
