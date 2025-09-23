import type { Static, TSchema, TVoid } from '@sinclair/typebox'
import { Type as T } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import type { Arrayable } from '@/types/internal.types.js'

// Types
interface FetchHelperOptions {
    token: string
    url: string
}

type JSONBody = string | number | boolean | Date | undefined | null | JSONBody[] | { [key: string]: JSONBody } | object

type SearchParams = { [key: string]: Arrayable<string | number | boolean | Date | undefined> | undefined }

// Error
const apiErrorSchema = T.Object({
    error: T.String(),
})

export class FetchError extends Error {
    public url: string
    public res: Response

    public constructor(url: string, res: Response) {
        super(`[Recal] Failed to fetch from ${url} with status ${res.status} and ${res.statusText}`)
        this.url = url
        this.res = res
    }

    get status() {
        return this.res.status
    }

    get statusText() {
        return this.res.statusText
    }

    async getError(): Promise<string> {
        if (this.res.headers.get('Content-Type')?.includes('application/json')) {
            const json = await this.res.json()
            if (Value.Check(apiErrorSchema, json)) return Value.Parse(apiErrorSchema, json).error
            return JSON.stringify(json)
        }
        return this.res.text()
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
        if (!response.ok) throw new FetchError(url, response)
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
