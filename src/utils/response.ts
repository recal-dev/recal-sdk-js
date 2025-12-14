/**
 * Response unwrapping utilities for HeyAPI SDK responses
 */

import { createRecalError, type RecalErrorCode } from '../errors'

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
 * Maps HTTP status code to error code and message
 */
function getErrorInfo(statusCode: number | undefined, error: unknown): { code: RecalErrorCode; message: string } {
    // Try to extract message from error object first
    let message: string | undefined
    if (error) {
        if (typeof error === 'string') message = error
        else if (typeof error === 'object') {
            if ('message' in error && error.message) message = String(error.message)
            else if ('error' in error && error.error) message = String(error.error)
        }
    }

    // Map status code to error code and fallback message
    switch (statusCode) {
        case 400:
            return { code: 'BAD_REQUEST', message: message ?? 'Bad request - Invalid parameters' }
        case 401:
            return {
                code: 'UNAUTHORIZED',
                message: message ?? 'Unauthorized - Invalid or missing authentication token',
            }
        case 403:
            return { code: 'FORBIDDEN', message: message ?? 'Forbidden - Access denied' }
        case 404:
            return { code: 'NOT_FOUND', message: message ?? 'Resource not found' }
        case 408:
            return { code: 'TIMEOUT', message: message ?? 'Request timeout' }
        case 409:
            return { code: 'CONFLICT', message: message ?? 'Conflict - Resource already exists' }
        case 422:
            return { code: 'VALIDATION_ERROR', message: message ?? 'Validation error - Invalid data provided' }
        case 429:
            return { code: 'RATE_LIMITED', message: message ?? 'Rate limit exceeded' }
        default:
            if (statusCode && statusCode >= 500) {
                return { code: 'SERVER_ERROR', message: message ?? 'Server error' }
            }
            return { code: 'UNKNOWN', message: message ?? 'Unknown API error' }
    }
}

/**
 * Extracts Retry-After header value in seconds
 */
function getRetryAfter(response?: Response): number | undefined {
    const header = response?.headers?.get('Retry-After')
    if (!header) return undefined

    const seconds = parseInt(header, 10)
    if (!Number.isNaN(seconds)) return seconds

    // Handle HTTP-date format
    const date = Date.parse(header)
    if (!Number.isNaN(date)) return Math.max(0, Math.ceil((date - Date.now()) / 1000))

    return undefined
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
    const statusCode = response.response?.status
    const isErrorStatus = statusCode !== undefined && statusCode >= 400

    // Check for HTTP error status or error object
    if (isErrorStatus || response.error) {
        const { code, message } = getErrorInfo(statusCode, response.error)
        const retryAfter = code === 'RATE_LIMITED' ? getRetryAfter(response.response) : undefined
        throw createRecalError({
            message,
            code,
            statusCode,
            details: response.error ?? response,
            retryAfter,
        })
    }

    if (!response.data) {
        throw createRecalError({
            message: 'No data in response',
            code: 'UNKNOWN',
            statusCode,
            details: response,
        })
    }

    // Check if data is nested ({ data: T }) or direct (T)
    if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
        return response.data.data
    }

    // Return direct data
    return response.data
}
