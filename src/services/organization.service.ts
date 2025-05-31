import { Organization, TimeRange } from '../types'
import { Provider } from '../types/calendar.types'

/**
 * Service class for handling organization operations
 */
export class OrganizationService {
    private fetch: (input: string, init?: RequestInit) => Promise<Response>

    /**
     * Creates a new instance of OrganizationService
     * @param baseUrl The base URL for the API
     * @param fetch Fetch function with authentication
     */
    constructor(fetch: (input: string, init?: RequestInit) => Promise<Response>) {
        this.fetch = fetch
    }

    /**
     * Get all organizations
     * @returns Promise<Organization[]>
     */
    async list(): Promise<Organization[]> {
        const response = await this.fetch('/organizations')
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to list organizations: Status ${response.status} - ${errorText}`)
        }
        return response.json() as Promise<Organization[]>
    }

    /**
     * Get organization by slug
     * @param slug Organization slug
     * @returns Promise<Organization>
     */
    async get(slug: string): Promise<Organization> {
        const response = await this.fetch(`/organizations/${slug}`)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get organization: Status ${response.status} - ${errorText}`)
        }
        return response.json() as Promise<Organization>
    }

    /**
     * Get free busy time ranges for all organization members
     * @param organizationSlug Organization slug
     * @param timeRange Time range
     * @param primaryOnly Only primary calendars of members (default: false)
     * @param provider Providers (default: undefined => all)
     * @returns Promise<TimeRange[]>
     */
    async getFreeBusy(
        organizationSlug: string,
        timeRange: TimeRange,
        primaryOnly?: boolean,
        provider?: Provider[]
    ): Promise<TimeRange[]> {
        const providerQuery = provider ? `&provider=${provider.join(',')}` : ''
        const query = `?timeMin=${timeRange.start.toISOString()}&timeMax=${timeRange.end.toISOString()}${providerQuery}${
            primaryOnly ? '&primaryOnly=true' : ''
        }`
        const response = await this.fetch(`/organizations/${organizationSlug}/calendar/free-busy${query}`)
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`[Recal] Failed to get organization free-busy: Status ${response.status} - ${errorText}`)
        }
        return response.json() as Promise<TimeRange[]>
    }
}
