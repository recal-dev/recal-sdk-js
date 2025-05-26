export type Organization = {
    name: string | null
    createdAt: Date
    slug: string
}

export type OrganizationMember = {
    createdAt: Date
    userId: string
}
