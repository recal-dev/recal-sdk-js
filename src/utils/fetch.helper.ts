import type { Static, TSchema, TVoid } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import type { Arrayable } from '@/types/internal.types.js'

// Types
interface FetchHelperOptions {
    token: string
    url: string
}

type JSONBody =
    | string
    | number
    | boolean
    | Date
    | undefined
    | null
    | JSONBody[]
    | { [key: string]: JSONBody }
    | object

type SearchParams = { [key: string]: Arrayable<string | number | boolean | Date | undefined> | undefined }

// Error
export class FetchError extends Error {
    public status: number
    public statusText: string

    public constructor(url: string, status: number, statusText: string) {
        super(`[Recal] Failed to fetch from ${url} with status ${status} and ${statusText}`)
        this.status = status
        this.statusText = statusText
    }
}

export { errorHandler } from './fetchErrorHandler'

// MARK: - FetchHelper
export class FetchHelper {
    private token: string
    private baseUrl: string

    public constructor(options: FetchHelperOptions) {
        this.token = options.token
        this.baseUrl = options.url
    }

    // MARK: Private
    public async __fetch(url: string, options?: RequestInit) {
        const completeUrl = url.startsWith('/') ? `${this.baseUrl}${url}` : `${this.baseUrl}/${url}`
        const response = await fetch(completeUrl, {
            ...options,
            headers: {
                ...options?.headers,
                Authorization: `Bearer ${this.token}`,
                ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
            },
        })
        return response
    }

    public async _fetch<S extends Static<Schema>, Schema extends TSchema = TVoid, R = S extends TVoid ? void : S>(
        _url: string,
        {
            body,
            searchParams: _searchParams,
            headers,
            schema,
            options,
        }: {
            body?: JSONBody
            searchParams?: SearchParams
            headers?: Record<string, string>
            schema?: Schema
            options?: RequestInit
        }
    ): Promise<R> {
        const params = new URLSearchParams()
        if (_searchParams) {
            Object.entries(_searchParams).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((v) => v && params.append(key, v.toString()))
                } else if (value !== undefined) {
                    params.append(key, value.toString())
                }
            })
        }
        const url = params.toString() ? `${_url}?${params.toString()}` : _url
        const response = await this.__fetch(url, { ...options, body: JSON.stringify(body), headers })
        if (!response.ok) throw new FetchError(url, response.status, response.statusText)
        if (schema !== undefined) {
            const data = await response.json()
            return Value.Parse(schema, data)
        }
        return void 0 as R
    }

    // MARK: Methods
    public async get<T extends Static<S>, S extends TSchema>(
        _url: string,
        {
            searchParams,
            headers,
            schema,
            options,
        }: {
            searchParams?: SearchParams
            headers?: Record<string, string>
            schema?: S
            options?: RequestInit
        }
    ): Promise<T> {
        return this._fetch(_url, {
            searchParams,
            headers,
            schema,
            options: { method: 'GET', ...options },
        })
    }

    public async post<T extends Static<S>, S extends TSchema>(
        _url: string,
        {
            body,
            searchParams,
            headers,
            schema,
            options,
        }: {
            body?: JSONBody
            searchParams?: SearchParams
            headers?: Record<string, string>
            schema?: S
            options?: RequestInit
        }
    ): Promise<T> {
        return this._fetch(_url, {
            body,
            searchParams,
            headers,
            schema,
            options: { method: 'POST', ...options },
        })
    }

    public async put<T extends Static<S>, S extends TSchema>(
        _url: string,
        {
            body,
            searchParams,
            headers,
            schema,
            options,
        }: {
            body?: JSONBody
            searchParams?: SearchParams
            headers?: Record<string, string>
            schema?: S
            options?: RequestInit
        }
    ): Promise<T> {
        return this._fetch(_url, {
            body,
            searchParams,
            headers,
            schema,
            options: { method: 'PUT', ...options },
        })
    }

    public async delete<T extends Static<S>, S extends TSchema>(
        _url: string,
        {
            body,
            searchParams,
            headers,
            schema,
            options,
        }: {
            body?: JSONBody
            searchParams?: SearchParams
            headers?: Record<string, string>
            schema?: S
            options?: RequestInit
        }
    ): Promise<T> {
        return this._fetch(_url, {
            body,
            searchParams,
            headers,
            schema,
            options: { method: 'DELETE', ...options },
        })
    }
}
