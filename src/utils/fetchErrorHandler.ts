import { FetchError } from './fetch.helper'

type HandlerResult<T> = Exclude<T, Error>
type Handler<T> = ((e: FetchError) => HandlerResult<T>) | HandlerResult<T>
type CatchHandler<T> = (e: unknown) => HandlerResult<T>
/**
 * ErrorHandler Object
 * @param code The HTTP status code to handle
 * @param error The error to throw on match of the HTTP status code
 * @param result The result to return on match of the HTTP status code
 */
type ErrorHandlerObj<T> = {
    code: number
    filter?: (error: FetchError) => boolean
    statusTextInclFilter?: string | string[]
} & ({ error: Error } | { result: Handler<T> })

export const errorHandler =
    <T = never>(errHandlers: ErrorHandlerObj<T>[], _catch?: CatchHandler<T>) =>
    (error: Error): HandlerResult<T> => {
        if (error instanceof FetchError) {
            for (const errHandler of errHandlers) {
                if (errHandler.code === error.status) {
                    // if filter is set, check if it matches, if not: continue
                    if (errHandler.filter && !errHandler.filter(error)) continue
                    // if statusTextInclFilter is set, check if any matches, if not: continue
                    if (errHandler.statusTextInclFilter) {
                        if (Array.isArray(errHandler.statusTextInclFilter)) {
                            if (!errHandler.statusTextInclFilter.some((filter) => error.statusText.includes(filter)))
                                continue
                        } else if (!error.statusText.includes(errHandler.statusTextInclFilter)) continue
                    }
                    // if result is set, return it, if not: throw the defined error
                    if ('result' in errHandler) {
                        if (errHandler.result instanceof Function) return errHandler.result(error)
                        return errHandler.result
                    }
                    throw errHandler.error
                }
            }
        }
        if (_catch) return _catch(error) as HandlerResult<T>
        throw error
    }
