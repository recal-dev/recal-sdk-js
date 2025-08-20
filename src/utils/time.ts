import { Type as T } from '@sinclair/typebox'

export const exampleTime = '14:00'

export const time = (options?: Parameters<typeof T.String>[0]) =>
    T.Transform(
        T.String({
            description: 'Time in HH:mm format',
            examples: [exampleTime],
            ...options,
        })
    )
        .Decode((s) => {
            const [hours, minutes] = s.split(':').map(Number)
            return Number(hours) * 60 + Number(minutes)
        })
        .Encode((utcMinutes) => {
            const hours = Math.floor(utcMinutes / 60)
            const minutes = utcMinutes % 60
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        })
