/**
 * Recal SDK Error Classes
 * Stripe-style error subclasses for better DX
 */

/**
 * Error codes for programmatic error handling
 */
export type RecalErrorCode =
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'VALIDATION_ERROR'
    | 'RATE_LIMITED'
    | 'TIMEOUT'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN'

export interface RecalErrorOptions {
    message: string
    code: RecalErrorCode
    statusCode?: number
    details?: unknown
    retryAfter?: number
}

/**
 * Base error class for all Recal API errors
 */
export class RecalError extends Error {
    public readonly code: RecalErrorCode
    public readonly statusCode?: number
    public readonly details?: unknown
    public readonly retryAfter?: number

    constructor(options: RecalErrorOptions) {
        super(options.message)
        this.name = '[Recal Error]'
        this.code = options.code
        this.statusCode = options.statusCode
        this.details = options.details
        this.retryAfter = options.retryAfter
    }

    /** Type guard for RecalError */
    static is(error: unknown): error is RecalError {
        return error instanceof RecalError
    }
}

/**
 * Factory to create error subclasses with minimal boilerplate
 */
function createErrorClass(name: string, defaultCode: RecalErrorCode) {
    return class extends RecalError {
        constructor(options: Omit<RecalErrorOptions, 'code'> & { code?: RecalErrorCode }) {
            super({ ...options, code: options.code ?? defaultCode })
            this.name = name
        }
    }
}

// Error subclasses
export const RecalBadRequestError = createErrorClass('[Recal Bad Request Error]', 'BAD_REQUEST')
export const RecalUnauthorizedError = createErrorClass('[Recal Unauthorized Error]', 'UNAUTHORIZED')
export const RecalForbiddenError = createErrorClass('[Recal Forbidden Error]', 'FORBIDDEN')
export const RecalNotFoundError = createErrorClass('[Recal Not Found Error]', 'NOT_FOUND')
export const RecalTimeoutError = createErrorClass('[Recal Timeout Error]', 'TIMEOUT')
export const RecalConflictError = createErrorClass('[Recal Conflict Error]', 'CONFLICT')
export const RecalValidationError = createErrorClass('[Recal Validation Error]', 'VALIDATION_ERROR')
export const RecalRateLimitError = createErrorClass('[Recal Rate Limit Error]', 'RATE_LIMITED')
export const RecalServerError = createErrorClass('[Recal Server Error]', 'SERVER_ERROR')
export const RecalUnknownError = createErrorClass('[Recal Unknown Error]', 'UNKNOWN')

// Type exports for instanceof checks
export type RecalBadRequestError = InstanceType<typeof RecalBadRequestError>
export type RecalUnauthorizedError = InstanceType<typeof RecalUnauthorizedError>
export type RecalForbiddenError = InstanceType<typeof RecalForbiddenError>
export type RecalNotFoundError = InstanceType<typeof RecalNotFoundError>
export type RecalTimeoutError = InstanceType<typeof RecalTimeoutError>
export type RecalConflictError = InstanceType<typeof RecalConflictError>
export type RecalValidationError = InstanceType<typeof RecalValidationError>
export type RecalRateLimitError = InstanceType<typeof RecalRateLimitError>
export type RecalServerError = InstanceType<typeof RecalServerError>
export type RecalUnknownError = InstanceType<typeof RecalUnknownError>

/**
 * Factory function to create the appropriate error subclass based on error code
 */
export function createRecalError(options: RecalErrorOptions): RecalError {
    switch (options.code) {
        case 'BAD_REQUEST':
            return new RecalBadRequestError(options)
        case 'UNAUTHORIZED':
            return new RecalUnauthorizedError(options)
        case 'FORBIDDEN':
            return new RecalForbiddenError(options)
        case 'NOT_FOUND':
            return new RecalNotFoundError(options)
        case 'TIMEOUT':
            return new RecalTimeoutError(options)
        case 'CONFLICT':
            return new RecalConflictError(options)
        case 'VALIDATION_ERROR':
            return new RecalValidationError(options)
        case 'RATE_LIMITED':
            return new RecalRateLimitError(options)
        case 'SERVER_ERROR':
            return new RecalServerError(options)
        default:
            return new RecalUnknownError(options)
    }
}
