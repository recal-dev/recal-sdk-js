# Recal SDK Developer Documentation

## Architecture Deep Dive

### Core Design Principles

The Recal SDK follows a layered architecture with clear separation of concerns:

1. **Service Layer Pattern**: Services encapsulate API interactions and business logic
2. **Type-Safe Runtime Validation**: Dual type system with TypeScript + TypeBox
3. **Entity-First Design**: Rich domain models with static factory methods
4. **Centralized Error Handling**: Predictable error patterns with custom error classes
5. **Dependency Injection**: Services receive dependencies through constructor injection

## Type System & TypeBox Integration

### The Dual Type System

The SDK implements a sophisticated dual type system that provides both compile-time and runtime type safety:

```
TypeScript Types (.types.ts) → TypeBox Schemas (.tb.ts) → Runtime Validation
```

#### 1. TypeScript Types (`src/types/*.types.ts`)
- Pure TypeScript interfaces and enums
- Define the contract for domain models
- Provide compile-time type safety
- Source of truth for the domain model

#### 2. TypeBox Schemas (`src/typebox/*.tb.ts`)
- Runtime validation schemas generated from TypeScript types
- Uses @sinclair/typebox for JSON schema validation
- Enables automatic validation of API responses

#### 3. Entity Classes (`src/entities/*.ts`)
- Rich domain objects with methods and behavior
- Static `fromJson()` factory methods for deserialization
- Transform validated API data into domain objects
- Handle nested entity relationships

### Type Flow Example

```typescript
// 1. Define TypeScript type
interface User {
    id: string
    createdAt: Date
    organizations?: Organization[]
}

// 2. Auto-generated TypeBox schema
const userSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
    organizations: T.Optional(T.Array(organizationSchema))
})

// 3. Entity class with static factory
class User {
    static fromJson(json: Static<typeof userSchema>): User {
        return new User({
            ...json,
            organizations: json.organizations?.map(org => Organization.fromJson(org))
        })
    }
}

// 4. Service uses all three layers
async get(id: string): Promise<User> {
    const data = await this.fetchHelper.get(`/users/${id}`, {
        schema: userSchema  // Runtime validation
    })
    return User.fromJson(data)  // Entity transformation
}
```

## Service Architecture

### Service Pattern

Services follow a consistent pattern for maximum developer experience:

```typescript
export class UsersService {
    constructor(private fetchHelper: FetchHelper) {}
    
    // Method structure:
    // 1. Clear, descriptive method names
    // 2. JSDoc with parameters and returns
    // 3. Type-safe options objects for flexibility
    // 4. Runtime validation via schema parameter
    // 5. Entity transformation via fromJson()
    // 6. Error handling with custom error classes
}
```

### Key Service Patterns

#### 1. **Options Pattern for Flexibility**
```typescript
interface UserOptions {
    includeOrgs: boolean
    includeOAuth: boolean
}

async get(id: string, { includeOrgs = false, includeOAuth = false }: UserOptions)
```
- Use options objects with defaults for optional parameters
- Destructure with defaults in the method signature
- Makes API evolution easier without breaking changes

#### 2. **Include Helper for Query Building**
```typescript
searchParams: {
    ...includesHelper([
        [includeOrgs, 'organizations'],
        [includeOAuth, 'oauthConnections'],
    ])
}
```
- Conditionally build `includes` query parameters
- Clean, declarative syntax
- Reduces boilerplate for common patterns

#### 3. **Error Handler Chaining**
```typescript
.catch(errorHandler([
    [404, () => null],  // Return null for not found
    [403, () => { throw new UnauthorizedError() }]  // Custom error for forbidden
]))
```
- Map HTTP status codes to specific behaviors
- Return null for optional resources (404)
- Throw custom errors for exceptional cases
- Maintains clean async/await flow

#### 4. **Schema-Based Validation**
```typescript
await this.fetchHelper.get('/users', { 
    schema: T.Array(userSchema)  // Validates response is User[]
})
```
- Pass TypeBox schema to validate API responses
- Automatic parsing and validation
- Type inference from schema
- Fails fast with clear validation errors

### FetchHelper: The HTTP Layer

The `FetchHelper` class provides a type-safe abstraction over the Fetch API:

#### Key Features:
1. **Automatic Bearer Token Authentication**
2. **Type-Safe Request/Response Handling**
3. **Runtime Schema Validation**
4. **Custom Error Classes**
5. **Search Parameter Building**

#### Generic Type Flow:
```typescript
async get<T extends Static<S>, S extends TSchema>(
    url: string,
    { schema?: S }: { schema?: S }
): Promise<T>
```
- `S`: The TypeBox schema type
- `T`: The inferred TypeScript type from the schema
- Returns validated and typed data

## Best Practices

### 1. Service Method Design

**DO:**
- Use clear, action-oriented method names (`listAll()`, `create()`, `get()`)
- Return entities, not raw API responses
- Handle common errors gracefully (404 → null)
- Use options objects for flexibility
- Add JSDoc comments with examples

**DON'T:**
- Return raw JSON from services
- Mix business logic with HTTP concerns
- Use positional parameters for optional values
- Forget error handling

### 2. Entity Design

**DO:**
- Implement `static fromJson()` for deserialization
- Handle nested entity relationships
- Keep entities immutable when possible
- Add helper methods for common operations

**DON'T:**
- Put API logic in entities
- Create circular dependencies
- Mutate entity state directly

### 3. Error Handling

**DO:**
- Create specific error classes for domain errors
- Map HTTP errors to domain errors in services
- Use the errorHandler utility for clean error mapping
- Return null for optional resources (404)

**DON'T:**
- Let HTTP errors bubble up to consumers
- Use generic Error classes
- Swallow errors silently

### 4. TypeBox Schema Usage

**DO:**
- Keep schemas in sync with TypeScript types
- Use schema composition for nested types
- Validate all external data
- Use `Static<typeof schema>` for type inference

**DON'T:**
- Edit `.tb.ts` files manually
- Skip validation for "trusted" data
- Use `any` types in schemas

## Adding New Features

### Step 1: Define the Domain Model

1. Create TypeScript interfaces in `src/types/`
2. Define enums for constant values
3. Consider relationships to existing models

### Step 2: Generate TypeBox Schemas

1. Run the schema generation command
2. Verify generated schemas match expectations
3. Check for proper optional fields

### Step 3: Create Entity Classes

1. Create entity class in `src/entities/`
2. Implement `static fromJson()` method
3. Handle nested entity transformations
4. Add domain methods as needed

### Step 4: Implement Service

1. Create service class in `src/services/`
2. Inject `FetchHelper` via constructor
3. Implement CRUD methods as needed
4. Use consistent patterns from other services
5. Add comprehensive JSDoc comments

### Step 5: Wire into Client

1. Add service property to `RecalClient`
2. Initialize in constructor
3. Export types from main index

### Step 6: Test

1. Write unit tests for entity transformations
2. Test service methods with mock responses
3. Verify error handling paths
4. Check TypeScript types compile correctly

## Common Patterns

### Conditional Includes
```typescript
// Build dynamic query parameters based on options
const searchParams = {
    ...includesHelper([
        [includeOrgs, 'organizations'],
        [includeOAuth, 'oauthConnections'],
    ])
}
```

### Null-Safe Gets
```typescript
// Return null instead of throwing for 404s
.catch(errorHandler([[404, () => null]]))
```

### Lazy Configuration
```typescript
// Support both values and functions for config
const token = functionize(options.token) || process.env.RECAL_TOKEN
```

### Entity Composition
```typescript
// Transform nested API data to entities
organizations: json.organizations?.map(org => Organization.fromJson(org))
```

## Debugging Tips

1. **Type Errors**: Check that TypeBox schemas match TypeScript types
2. **Validation Errors**: Use `Value.Check()` to debug schema mismatches
3. **Network Errors**: Check FetchError status and statusText
4. **Entity Errors**: Verify fromJson() handles all fields correctly
5. **Import Errors**: Ensure proper path resolution (use `src/` prefix)

## Performance Considerations

1. **Schema Validation**: Happens on every API response - keep schemas simple
2. **Entity Creation**: Use static factories to avoid unnecessary allocations
3. **Include Parameters**: Only request data you need
4. **Error Handlers**: Keep error mapping functions lightweight
5. **Type Inference**: Let TypeScript infer types where possible

## Security Notes

1. **Token Storage**: Never expose tokens in client-side code
2. **Input Validation**: Always validate external data with schemas
3. **Error Messages**: Don't leak sensitive information in errors
4. **HTTPS Only**: The SDK enforces HTTPS for all API calls
5. **Scope Management**: Use minimal OAuth scopes required

## Future Considerations

As the SDK evolves, maintain these principles:

1. **Backwards Compatibility**: Use options objects for new parameters
2. **Type Safety**: Keep TypeScript and TypeBox schemas in sync
3. **Consistency**: Follow established patterns for new services
4. **Documentation**: Update JSDoc and this guide for new patterns
5. **Testing**: Maintain high test coverage for critical paths