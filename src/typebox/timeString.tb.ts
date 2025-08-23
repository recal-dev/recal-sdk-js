import type { DateOptions } from '@sinclair/typebox'
import { Type as T } from '@sinclair/typebox'

export const timeString = (options?: DateOptions) =>
    T.String({
        description: 'Time in HH:mm format',
        pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        ...options,
    })
