import type { Functionize } from '../utils/functionize'

export interface RecalOptions {
    token?: Functionize<string>
    url?: Functionize<string>
}

export type Arrayable<T> = T | T[]
