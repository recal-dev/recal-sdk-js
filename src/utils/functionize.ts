type FunctionizeValue = object | string | number | boolean | undefined | Array<unknown>

export type Functionize<T extends FunctionizeValue> = T | (() => T)

export function functionize<T extends FunctionizeValue>(value: Functionize<T>): T {
    if (typeof value === 'function') return value()
    return value
}
