/**
 * Response unwrapping utilities for HeyAPI SDK responses
 */

/**
 * HeyAPI SDK response structure
 * Can contain either nested data ({ data: T }) or direct data (T)
 */
export interface HeyApiResponse<T> {
    data?: { data: T } | T
    error?: unknown
    request?: Request
    response?: Response
}

/**
 * Custom error class for Recal API errors
 */
export class RecalError extends Error {
    public readonly statusCode?: number
    public readonly details?: unknown

    constructor(message: string, statusCode?: number, details?: unknown) {
        // Add red [RECAL] prefix to error message
        const formattedMessage = `\x1b[31m[RECAL]\x1b[0m ${message}`
        super(formattedMessage)
        this.name = 'RecalError'
        this.statusCode = statusCode
        this.details = details
    }
}

/**
 * Unwraps HeyAPI response structure to extract clean data
 * Throws RecalError if the response contains an error or no data
 *
 * @param response - The HeyAPI response object
 * @returns The extracted data of type T
 * @throws RecalError if response contains an error or no data
 */
export function unwrapResponse<T>(response: HeyApiResponse<T>): T {
    // Check if error object has actual content (not just empty {})
    if (response.error && typeof response.error === 'object' && Object.keys(response.error).length > 0) {
        const statusCode = response.response?.status

        // Extract error message safely from unknown type
        let errorMessage = 'Unknown API error'
        if (typeof response.error === 'string') {
            errorMessage = response.error
        } else if (response.error && typeof response.error === 'object' && 'message' in response.error) {
            errorMessage = String(response.error.message)
        } else if (response.error && typeof response.error === 'object' && 'error' in response.error) {
            errorMessage = String(response.error.error)
        }

        throw new RecalError(errorMessage, statusCode, response.error)
    }

    if (!response.data) {
        throw new RecalError('No data in response', response.response?.status, response)
    }

    // Check if data is nested ({ data: T }) or direct (T)
    if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
        return response.data.data
    }

    // Return direct data
    return response.data
}

/**
 * Unwraps a HeyAPI response to the API's whole envelope rather than its `data` field.
 *
 * For the responses that carry a sibling of `data`, where dropping it would let a partial
 * answer read as a complete one: the organization free/busy routes report `failedUsers`
 * there, and the user busy route reports `failedCalendars`. Error handling is identical to {@link unwrapResponse}: the error branch
 * below delegates to it, which re-tests the same condition and always throws there —
 * it never returns.
 */
export function unwrapEnvelope<T>(response: HeyApiResponse<unknown>): T {
    if (response.error && typeof response.error === 'object' && Object.keys(response.error).length > 0) {
        return unwrapResponse(response as HeyApiResponse<T>)
    }

    if (!response.data) {
        throw new RecalError('No data in response', response.response?.status, response)
    }

    // The generated response types describe the envelope; HeyAPI's `data` is typed loosely
    // as the union `{ data: T } | T`, so this narrowing can't be expressed without a cast.
    return response.data as T
}
