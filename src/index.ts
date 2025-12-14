// Main SDK export

export { Recal, RecalClient, type RecalOptions } from './client'
// Advanced: Re-export client utilities for custom client creation
export { createClient, createConfig } from './client/client'
// Advanced: Re-export all SDK functions for direct usage without client wrapper
export * as RecalSDK from './client/sdk.gen'
// Re-export error classes and types
export {
    createRecalError,
    RecalBadRequestError,
    RecalConflictError,
    RecalError,
    type RecalErrorCode,
    type RecalErrorOptions,
    RecalForbiddenError,
    RecalNetworkError,
    RecalNotFoundError,
    RecalRateLimitError,
    RecalServerError,
    RecalTimeoutError,
    RecalUnauthorizedError,
    RecalUnknownError,
    RecalValidationError,
} from './errors'
// Re-export commonly used types for better DX
export type * from './types'
