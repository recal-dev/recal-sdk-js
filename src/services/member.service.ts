import { OrganizationMember } from '../types/entity.types'
import { MemberCalendarService } from './memberCalendar.service'
import { OAuthService } from './oauth.service'

/**
 * Service class for handling member operations
 */
export class MemberService {
    private organizationSlug: string
    private fetch: (input: string, init?: RequestInit) => Promise<Response>
    public oauth: OAuthService
    public calendar: MemberCalendarService

    /**
     * Creates a new instance of MemberService
     * @param organizationSlug The organization slug
     * @param fetch Fetch function with authentication
     */
    constructor(organizationSlug: string, fetch: (input: string, init?: RequestInit) => Promise<Response>) {
        this.organizationSlug = organizationSlug
        this.fetch = fetch
        this.oauth = new OAuthService(organizationSlug, fetch)
        this.calendar = new MemberCalendarService(organizationSlug, fetch)
    }

    /**
     * List members of an organization
     * @returns Promise<OrganizationMember[]>
     */
    async list(): Promise<OrganizationMember[]> {
        const response = await this.fetch(`/organizations/${this.organizationSlug}/members`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.json() as Promise<OrganizationMember[]>
    }

    /**
     * Get member of an organization
     * @param userId User ID
     * @returns Promise<OrganizationMember>
     */
    async get(userId: string): Promise<OrganizationMember> {
        const response = await this.fetch(`/organizations/${this.organizationSlug}/members/${userId}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.json() as Promise<OrganizationMember>
    }

    /**
     * Create member in an organization
     * @param userId User ID
     * @returns Promise<OrganizationMember>
     */
    async create(userId: string): Promise<OrganizationMember> {
        const response = await this.fetch(`/organizations/${this.organizationSlug}/members`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.json() as Promise<OrganizationMember>
    }

    /**
     * Delete member from an organization
     * @param userId User ID
     */
    async delete(userId: string): Promise<void> {
        const response = await this.fetch(`/organizations/${this.organizationSlug}/members/${userId}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    }
}
