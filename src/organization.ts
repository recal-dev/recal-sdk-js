import type { User } from './user'

export class Organization {
    constructor(
        public slug: string,
        public name: string | null,
        public createdAt: Date,
        public members?: User[]
    ) {}

    public getMembers(): User[] {
        return []
    }
}
