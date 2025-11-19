// Main SDK export

// Advanced: Re-export client utilities for custom client creation
export { createClient, createConfig } from './client/client'
// Advanced: Re-export all SDK functions for direct usage without client wrapper
export * as RecalSDK from './client/sdk.gen'
export { Recal, RecalClient, type RecalOptions } from './recal'
// Re-export commonly used types for better DX
export type * from './types'
// Re-export error class
export { RecalError } from './utils/response'
