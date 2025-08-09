import type { Static, TSchema } from '@sinclair/typebox'

// Types
interface FetchHelperOptions {
    token: string
    url: string
}

export class FetchError extends Error {
    public status: number
    public statusText: string

    public constructor(url: string, status: number, statusText: string) {
        super(`[Recal] Failed to fetch from ${url} with status ${status} and ${statusText}`)
        this.status = status
        this.statusText = statusText
    }
}

// FetchHelper
export class FetchHelper {
    private token: string
    private baseUrl: string

    public constructor(options: FetchHelperOptions) {
        this.token = options.token
        this.baseUrl = options.url
    }

    public async baseFetch(url: string, options?: RequestInit) {
        const response = await fetch(`${this.baseUrl}${url}`, {
            ...options,
            headers: {
                ...options?.headers,
                Authorization: `Bearer ${this.token}`,
            },
        })
        return response
    }

    public async fetch<T extends Static<S>, S extends TSchema>(
        url: string,
        schema: S,
        options?: RequestInit
    ): Promise<T> {
        const response = await this.baseFetch(url, options)
        if (!response.ok) throw new FetchError(url, response.status, response.statusText)
        const data = await response.json()
        return schema.parse(data)
    }
}
