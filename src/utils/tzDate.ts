import type { DateOptions } from '@sinclair/typebox'
import { Type as T } from '@sinclair/typebox'
import { DateTime } from 'luxon'
import { getTimeZone } from 'src/typedi'

export const exampleTimeZone = 'Europe/Berlin'
const exampleDate = DateTime.now().setZone(exampleTimeZone).toISO()

export const tzDate = (options?: DateOptions) =>
	T
		.Transform(
			T.String({
				description: 'Date in ISO format with timezone',
				examples: [exampleDate],
				...options,
			}),
		)
		.Decode((s) => new Date(s))
		.Encode((d) => {
			const timeZone = getTimeZone()
			const timeZonedDate = DateTime.fromISO(d.toISOString()).setZone(timeZone)
			return timeZonedDate.toISO()!
		})

// Helper
export const tzDateExample = (date: Date) => DateTime.fromISO(date.toISOString()).setZone(exampleTimeZone).toISO()
