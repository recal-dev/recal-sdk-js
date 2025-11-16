/**
 * Response unwrapping utilities for HeyAPI SDK responses
 */

/**
 * HeyAPI SDK response structure
 */
export interface HeyApiResponse<T> {
    data?: { data: T }
    error?: any
    request?: any
    response?: any
}

/**
 * Custom error class for Recal API errors
 */
export class RecalError extends Error {
    public readonly statusCode?: number
    public readonly details?: any

    constructor(message: string, statusCode?: number, details?: any) {
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
    if (response.error && Object.keys(response.error).length > 0) {
        const statusCode = response.response?.status
        const errorMessage =
            typeof response.error === 'string' ? response.error : response.error.message || 'Unknown API error'

        throw new RecalError(errorMessage, statusCode, response.error)
    }

    if (!response.data?.data) {
        throw new RecalError('No data in response', response.response?.status, response)
    }

    return response.data.data
}
