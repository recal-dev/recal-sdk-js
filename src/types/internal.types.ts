import type { Functionize } from '../utils/functionize.js'

export interface RecalOptions {
    token?: Functionize<string>
    url?: Functionize<string>
}

export type Arrayable<T> = T | T[]
