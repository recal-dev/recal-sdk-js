import { Type as T } from '@sinclair/typebox'
import { OrganizationNotFoundError, UserAlreadyExistsError, UserNotFoundError } from 'src/errors'
import { includesHelper } from 'src/utils/includes.helper'
import { User } from '../entities/user'
import { userSchema } from '../typebox/user.tb'
import { errorHandler, type FetchHelper } from '../utils/fetch.helper'

interface UserOptions {
    includeOrgs?: boolean
    includeOAuth?: boolean
}

export class UsersService {
    constructor(private fetchHelper: FetchHelper) {}

    /**
     * List all users
     * @returns An array of users
     */
    public async listAll(): Promise<User[]> {
        return this.fetchHelper
            .get('/v1/users', { schema: T.Array(userSchema) })
            .then((users) => users.map((user) => User.fromJson(user, this.fetchHelper)))
    }

    /**
     * Get a user by ID
     * @param id The ID of the user
     * @param options Options for the user
     * @returns The user
     */
    public async get(id: string, { includeOrgs = false, includeOAuth = false }: UserOptions): Promise<User | null> {
        return this.fetchHelper
            .get(`/v1/users/${id}`, {
                schema: userSchema,
                searchParams: {
                    ...includesHelper([
                        [includeOrgs, 'organizations'],
                        [includeOAuth, 'oauthConnections'],
                    ]),
                },
            })
            .catch(errorHandler([{ code: 404, result: null }]))
            .then((user) => (user ? User.fromJson(user, this.fetchHelper) : null))
    }

    /**
     * Create a new user
     * @param id The ID of the user
     * @param organizationSlugs The slugs of the organizations the user is a member of
     * @returns The new user
     */
    public async create(id: string, organizationSlugs?: string[]): Promise<User> {
        return this.fetchHelper
            .post(`/v1/users`, {
                body: { id, organizationSlugs },
                schema: userSchema,
            })
            .catch(
                errorHandler([
                    { code: 404, error: new OrganizationNotFoundError(id) },
                    { code: 409, error: new UserAlreadyExistsError(id) },
                ])
            )
            .then((user) => User.fromJson(user, this.fetchHelper))
    }

    /**
     * Update a user
     * @param id The ID of the user
     * @param updatedUserData The updated user data
     * @returns The updated user
     */
    public async update(id: string, updatedUserData: { id: string }): Promise<User | null> {
        return this.fetchHelper
            .put(`/v1/users/${id}`, {
                body: {
                    userId: updatedUserData.id,
                },
                schema: userSchema,
            })
            .catch(
                errorHandler([
                    { code: 404, result: null },
                    { code: 409, error: new UserAlreadyExistsError(id) },
                ])
            )
            .then((updatedUser) => (updatedUser ? User.fromJson(updatedUser, this.fetchHelper) : null))
    }

    /**
     * Delete a user
     * @param id The ID of the user
     * @returns The deleted user
     */
    public async delete(id: string): Promise<User> {
        return this.fetchHelper
            .delete(`/v1/users/${id}`, {
                schema: userSchema,
            })
            .catch(errorHandler([{ code: 404, error: new UserNotFoundError(id) }]))
            .then((user) => User.fromJson(user, this.fetchHelper))
    }
}
