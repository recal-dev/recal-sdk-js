# Recal SDK Developer Guide

## Quick Start

The Recal SDK follows a clean, layered architecture designed for developer productivity and type safety. Here's what you need to know to get started quickly.

### Core Concepts

1. **Services** handle API interactions and return domain entities
2. **Entities** are rich domain models with behavior and static factories
3. **FetchHelper** provides type-safe HTTP communication with automatic validation
4. **Error Handlers** map HTTP errors to domain-specific errors

### Basic Usage Pattern

```typescript
// 1. Service method with options
const user = await client.users.get('user-123', {
    includeOrgs: true,
    includeOAuth: false
})

// 2. Returns typed entity (User | null)
if (user) {
    console.log(user.id, user.organizations)
}
```

## Architecture Overview

### The Type System

The SDK uses a dual type system for both compile-time and runtime safety:

```
TypeScript Types → TypeBox Schemas → Runtime Validation → Domain Entities
```

#### 1. TypeScript Types (`src/types/`)
Define the domain contracts with interfaces and enums.

#### 2. TypeBox Schemas (`src/typebox/`)
Semi-auto-generated runtime validation schemas.

#### 3. Entity Classes (`src/entities/`)
Rich domain objects with static `fromJson()` factories for deserialization.

### Service Architecture

All services follow this consistent pattern:

```typescript
export class ExampleService {
    constructor(private fetchHelper: FetchHelper) {}
    
    async get(id: string, options = {}): Promise<Entity | null> {
        return this.fetchHelper
            .get(`/v1/resource/${id}`, {
                schema: entitySchema,
                searchParams: { ...buildParams(options) }
            })
            .catch(errorHandler([{ code: 404, result: null }]))
            .then(data => data ? Entity.fromJson(data) : null)
    }
}
```

## Key Patterns

### 1. Options Objects

Use destructured options with defaults for flexibility:

```typescript
interface UserOptions {
    includeOrgs: boolean
    includeOAuth: boolean
}

async get(id: string, { includeOrgs = false, includeOAuth = false }: UserOptions = {})
```

### 2. Include Helper

Build conditional query parameters cleanly:

```typescript
searchParams: {
    ...includesHelper([
        [includeOrgs, 'organizations'],
        [includeOAuth, 'oauthConnections'],
    ])
}
// Result: { includes: ['organizations'] } if includeOrgs is true
```

### 3. Error Handling

Map HTTP status codes to domain behaviors:

```typescript
.catch(errorHandler([
    { code: 404, result: null },                    // Return null for not found
    { code: 409, error: new UserExistsError(id) },  // Throw domain error
    { 
        code: 404, 
        statusTextInclFilter: 'OAuth connection not found',
        error: new OAuthNotFoundError(userId, provider) 
    }
]))
```

### 4. FetchHelper Usage

The FetchHelper provides type-safe HTTP operations:

```typescript
// GET with query parameters
await this.fetchHelper.get('/v1/users', {
    schema: T.Array(userSchema),
    searchParams: { 
        limit: 10,
        provider: ['google', 'microsoft'],  // Arrays supported
        active: true
    }
})

// POST with body
await this.fetchHelper.post('/v1/users', {
    schema: userSchema,
    body: { id: 'user-123', email: 'user@example.com' }
})
```

## Working with Entities

### Entity Pattern

All entities follow this structure:

```typescript
export class User {
    constructor(private data: UserData) {}
    
    // Static factory for deserialization
    static fromJson(json: Static<typeof userSchema>): User {
        return new User({
            ...json,
            organizations: json.organizations?.map(org => Organization.fromJson(org))
        })
    }
    
    // Domain methods
    public hasOrganization(slug: string): boolean {
        return this.organizations?.some(org => org.slug === slug) ?? false
    }
}
```

### Handling Nested Relationships

Entities handle nested transformations in their `fromJson()` methods:

```typescript
static fromJson(json: Static<typeof userSchema>): User {
    return new User({
        ...json,
        organizations: json.organizations?.map(org => Organization.fromJson(org)),
        oauthConnections: json.oauthConnections // Raw objects for simple types
    })
}
```

## Real-World Examples

### Complete Service Implementation

Here's how the `UsersService.get()` method works:

```typescript
public async get(id: string, { includeOrgs = false, includeOAuth = false }: UserOptions = {}): Promise<User | null> {
    return this.fetchHelper
        .get(`/v1/users/${id}`, {
            schema: userSchema,
            searchParams: {
                ...includesHelper([
                    [includeOrgs, 'organizations'],
                    [includeOAuth, 'oauthConnections'],
                ])
            }
        })
        .catch(errorHandler([{ code: 404, result: null }]))
        .then(user => user ? User.fromJson(user) : null)
}
```

### OAuth Service with Error Filtering

```typescript
public async getConnection(userId: string, provider: Provider, redacted = true): Promise<OAuthConnection> {
    return this.fetchHelper
        .get(`/v1/users/${userId}/oauth/${provider}`, {
            schema: oauthConnectionSchema,
            searchParams: { redacted }
        })
        .catch(errorHandler([
            {
                code: 404,
                statusTextInclFilter: 'OAuth connection not found',
                error: new OAuthConnectionNotFoundError(userId, provider)
            },
            { code: 404, error: new UserNotFoundError(userId) }
        ]))
}
```

## Implementation Guide

### Adding a New Service

#### Step 1: Define Types
Create TypeScript interfaces in `src/types/`:

```typescript
// src/types/calendar.types.ts
export interface Calendar {
    id: string
    name: string
    primary: boolean
    timezone: string
}
```

#### Step 2: Generate Schemas
Run schema generation (TypeBox schemas are auto-generated from TypeScript types).

#### Step 3: Create Entity
```typescript
// src/entities/calendar.ts
export class Calendar {
    constructor(private data: CalendarData) {}
    
    static fromJson(json: Static<typeof calendarSchema>): Calendar {
        return new Calendar(json)
    }
    
    get isPrimary(): boolean {
        return this.data.primary
    }
}
```

#### Step 4: Implement Service
```typescript
// src/services/calendars.service.ts
export class CalendarsService {
    constructor(private fetchHelper: FetchHelper) {}
    
    async list(userId: string): Promise<Calendar[]> {
        return this.fetchHelper
            .get(`/v1/users/${userId}/calendars`, {
                schema: T.Array(calendarSchema)
            })
            .then(calendars => calendars.map(Calendar.fromJson))
    }
}
```

#### Step 5: Wire into Client
Add the service to the main `RecalClient` class and export types.

## Best Practices

### Service Design
✅ **DO:**
- Use options objects with defaults: `{ includeOrgs = false } = {}`
- Return entities, not raw JSON: `User.fromJson(data)`
- Handle 404s gracefully: `{ code: 404, result: null }`
- Add comprehensive JSDoc comments

❌ **DON'T:**
- Use positional parameters for options
- Return raw API responses
- Let HTTP errors bubble up unhandled

### Error Handling
✅ **DO:**
- Create specific error classes: `UserNotFoundError`
- Use error handlers for clean mapping
- Filter errors by status text when needed

❌ **DON'T:**
- Use generic `Error` classes
- Swallow errors silently
- Mix error handling with business logic

### Entity Design
✅ **DO:**
- Keep entities immutable where possible
- Add domain methods for business logic
- Handle nested relationships in `fromJson()`

❌ **DON'T:**
- Put API calls in entities
- Create circular dependencies
- Mutate entity state directly

## Common Patterns Reference

### Null-Safe Resource Fetching
```typescript
.catch(errorHandler([{ code: 404, result: null }]))
```

### Multiple Error Conditions
```typescript
.catch(errorHandler([
    { code: 404, error: new ResourceNotFoundError(id) },
    { code: 409, error: new ResourceExistsError(id) },
    { code: 400, error: new ValidationError('Invalid data') }
]))
```

### Conditional Query Building
```typescript
searchParams: {
    ...includesHelper([
        [options.includeDeleted, 'deleted'],
        [options.includeMetadata, 'metadata']
    ]),
    limit: options.limit,
    offset: options.offset
}
```

### Array Query Parameters
```typescript
searchParams: {
    provider: ['google', 'microsoft'],  // Becomes: ?provider=google&provider=microsoft
    status: options.status              // undefined values are filtered out
}
```

## Debugging Tips

1. **Schema Validation Errors**: Use `Value.Check(schema, data)` to debug mismatches
2. **Network Issues**: Check `FetchError.status` and `FetchError.statusText`
3. **Type Issues**: Ensure TypeBox schemas match TypeScript types
4. **Entity Transformation**: Verify `fromJson()` handles all required fields
5. **Import Paths**: Use absolute imports with `src/` prefix

## Performance Notes

- **Schema validation** happens on every API response - keep schemas focused
- **Entity creation** uses static factories for efficiency
- **Include parameters** - only request data you actually need
- **Error handlers** should be lightweight functions

This guide covers the essential patterns for productive development with the Recal SDK. Follow these conventions to maintain consistency and reliability across the codebase.