import { FetchError } from './fetch.helper.js'

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
    errorInclFilter?: string | string[]
} & ({ error: Error } | { result: Handler<T> })

export const errorHandler =
    <T = never>(errHandlers: ErrorHandlerObj<T>[], _catch?: CatchHandler<T>) =>
    async (error: Error): Promise<HandlerResult<T>> => {
        if (error instanceof FetchError) {
            for (const errHandler of errHandlers) {
                if (errHandler.code === error.status) {
                    // if filter is set, check if it matches, if not: continue
                    if (errHandler.filter && !errHandler.filter(error)) continue
                    // if errorInclFilter is set, check if any matches, if not: continue
                    const errorText = await error.getError()
                    if (errHandler.errorInclFilter) {
                        if (Array.isArray(errHandler.errorInclFilter)) {
                            if (!errHandler.errorInclFilter.some((filter) => errorText.includes(filter))) continue
                        } else if (!errorText.includes(errHandler.errorInclFilter)) continue
                    }
                    // if result is set, return it, if not: throw the defined error
                    if ('result' in errHandler) {
                        if (errHandler.result instanceof Function) return errHandler.result(error)
                        return errHandler.result
                    }
                    throw new Error(`[Recal] API error (${error.status} ${error.statusText}): ${errorText}`)
                }
            }
            const errorText = await error.getError()
            throw new Error(`[Recal] Unknown API error (${error.status} ${error.statusText}): ${errorText}`)
        }
        if (_catch) return _catch(error)
        throw error
    }
