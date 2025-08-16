export const includesHelper = <T extends string>(includes: [boolean, T][]): { includes: T[] } => {
    return {
        includes: includes.reduce((acc, [include, value]) => {
            if (include) acc.push(value)
            return acc
        }, [] as T[]),
    }
}
