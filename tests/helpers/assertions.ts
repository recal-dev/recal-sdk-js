import { expect } from 'bun:test'
import type { AuthConnection, Calendar, Event, Organization, User } from '@/client/types.gen'

/**
 * Assert user object has expected properties
 *
 * @param user - User object to assert
 * @param expectedId - Optional expected user ID
 *
 * @example
 * ```typescript
 * assertUser(user, 'user-123')
 * ```
 */
export function assertUser(user: User, expectedId?: string) {
    expect(user).toBeDefined()
    expect(user.id).toBeDefined()
    expect(typeof user.id).toBe('string')
    expect(user.createdAt).toBeDefined()
    expect(user.createdAt).toBeInstanceOf(Date)

    if (expectedId) {
        expect(user.id).toBe(expectedId)
    }
}

/**
 * Assert organization object has expected properties
 *
 * @param org - Organization object to assert
 * @param expectedSlug - Optional expected organization slug
 *
 * @example
 * ```typescript
 * assertOrganization(org, 'acme-corp')
 * ```
 */
export function assertOrganization(org: Organization, expectedSlug?: string) {
    expect(org).toBeDefined()
    expect(org.slug).toBeDefined()
    expect(typeof org.slug).toBe('string')
    expect(org.createdAt).toBeDefined()
    expect(org.createdAt).toBeInstanceOf(Date)

    if (expectedSlug) {
        expect(org.slug).toBe(expectedSlug)
    }
}

/**
 * Assert calendar object has expected properties
 *
 * @param calendar - Calendar object to assert
 *
 * @example
 * ```typescript
 * assertCalendar(calendar)
 * ```
 */
export function assertCalendar(calendar: Calendar) {
    expect(calendar).toBeDefined()
    expect(calendar.id).toBeDefined()
    expect(calendar.provider).toBeDefined()
    expect(calendar.provider).toMatch(/^(google|microsoft)$/)
}

/**
 * Assert event object has expected properties
 *
 * @param event - Event object to assert
 *
 * @example
 * ```typescript
 * assertEvent(event)
 * ```
 */
export function assertEvent(event: Event) {
    expect(event).toBeDefined()
    expect(event.id).toBeDefined()
    expect(event.calendarId).toBeDefined()
    expect(event.provider).toBeDefined()
}

/**
 * Assert OAuth connection object has expected properties
 *
 * @param connection - AuthConnection object to assert
 *
 * @example
 * ```typescript
 * assertAuthConnection(connection)
 * ```
 */
export function assertAuthConnection(connection: AuthConnection) {
    expect(connection).toBeDefined()
    expect(connection.provider).toBeDefined()
    expect(connection.provider).toMatch(/^(google|microsoft)$/)
    expect(typeof connection.alive).toBe('boolean')
}
