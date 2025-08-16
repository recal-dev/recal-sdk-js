# TypeBox Deep Dive

## What is TypeBox?

TypeBox is a TypeScript library that creates runtime type validators from static type definitions. It bridges the gap between TypeScript's compile-time type safety and JavaScript's runtime environment, ensuring data from external sources (APIs, databases, user input) matches expected schemas.

## Why TypeBox in the Recal SDK?

The SDK uses TypeBox to:
1. **Validate API responses** at runtime
2. **Catch data inconsistencies** early
3. **Provide type inference** from schemas
4. **Generate JSON Schema** compatible validators
5. **Ensure type safety** across network boundaries

## Core TypeBox Concepts

### 1. Schema Definition
TypeBox schemas are built using the `Type` (aliased as `T`) builder:

```typescript
import { Type as T } from '@sinclair/typebox'

// Basic types
const stringSchema = T.String()
const numberSchema = T.Number()
const booleanSchema = T.Boolean()
const dateSchema = T.Date()

// Object schemas
const userSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
    isActive: T.Boolean()
})

// Arrays
const usersSchema = T.Array(userSchema)

// Optional fields
const profileSchema = T.Object({
    bio: T.Optional(T.String()),  // bio?: string
    age: T.Optional(T.Number())   // age?: number
})

// Union types
const statusSchema = T.Union([
    T.Literal('active'),
    T.Literal('inactive'),
    T.Literal('pending')
])

// Enums
enum Provider {
    GOOGLE = 'google',
    MICROSOFT = 'microsoft'
}
const providerSchema = T.Enum(Provider)
```

### 2. Type Inference with Static

The `Static` type extracts the TypeScript type from a TypeBox schema:

```typescript
import type { Static } from '@sinclair/typebox'

const userSchema = T.Object({
    id: T.String(),
    email: T.String(),
    createdAt: T.Date()
})

// Static infers the type:
type User = Static<typeof userSchema>
// Equivalent to:
// type User = {
//     id: string
//     email: string
//     createdAt: Date
// }
```

### 3. Runtime Validation with Value

The `Value` namespace provides runtime validation methods:

```typescript
import { Value } from '@sinclair/typebox/value'

// Parse: Validates and returns typed data (throws on invalid)
const user = Value.Parse(userSchema, jsonData)

// Check: Returns boolean (doesn't throw)
if (Value.Check(userSchema, jsonData)) {
    // jsonData is valid
}

// Errors: Get validation errors
const errors = [...Value.Errors(userSchema, jsonData)]
```

## FetchHelper Integration

### The Generic Type Magic

The FetchHelper uses complex generics to provide end-to-end type safety:

```typescript
public async get<T extends Static<S>, S extends TSchema>(
    _url: string,
    { schema?: S }: { schema?: S }
): Promise<T>
```

Breaking this down:
- `S extends TSchema`: S is a TypeBox schema
- `T extends Static<S>`: T is the TypeScript type inferred from schema S
- `schema?: S`: Optional schema parameter
- `Promise<T>`: Returns the inferred type

### Real-World Example in FetchHelper

```typescript
// In the _fetch method (line 50-82)
public async _fetch<S extends Static<Schema>, Schema extends TSchema = TVoid, R = S extends TVoid ? void : S>(
    _url: string,
    { schema, ...options }: { schema?: Schema, ... }
): Promise<R> {
    // ... make HTTP request ...
    const data = await response.json()
    
    // Line 80: Runtime validation happens here!
    if (schema !== undefined) return Value.Parse(schema, data)
    
    // If no schema, return void
    return void 0 as R
}
```

The clever part:
- If `schema` is provided → validates and returns typed data
- If no `schema` → returns `void` (for side-effect operations)
- Type `R` conditionally resolves based on schema presence

## Service Layer Usage

### Example: UsersService

Let's trace a complete flow through the UsersService:

```typescript
// 1. Define the TypeBox schema (src/typebox/user.tb.ts)
export const userSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
    organizations: T.Optional(T.Array(organizationSchema)),
    oauthConnections: T.Optional(T.Array(oauthConnectionSchema))
})

// 2. Use in service method (src/services/users.service.ts)
public async listAll(): Promise<User[]> {
    // Pass schema to validate response as User[]
    const users = await this.fetchHelper.get('/v1/users', { 
        schema: T.Array(userSchema)  // Validates array of users
    })
    
    // Transform validated data to entities
    return users.map((user) => User.fromJson(user))
}

// 3. Type inference flow:
// - T.Array(userSchema) → Static<typeof T.Array(userSchema)>
// - This infers to: Array<{ id: string, createdAt: Date, ... }>
// - fetchHelper.get returns this typed array
// - No manual type assertions needed!
```

### Complex Schema Example: OAuth Service

```typescript
// Complex conditional schema building (line 119 in oauth.service.ts)
const response = await this.fetchHelper.get(url, {
    schema: T.Object({ url: T.String() })  // Inline schema definition
})

// Array validation
const oauthLinks = await this.fetchHelper.get(url, {
    schema: T.Array(oauthLinkSchema)  // Validates array of OAuth links
})

// Using existing schemas
const oauthConnection = await this.fetchHelper.get(url, {
    schema: oauthConnectionSchema  // Pre-defined schema
})
```

## Advanced TypeBox Patterns

### 1. Composition with Spread

```typescript
// Base schema
const baseUserSchema = T.Object({
    id: T.String(),
    createdAt: T.Date()
})

// Extended schema using spread
export const userSchema = T.Object({
    ...baseUserSchema.properties,  // Spread base properties
    organizations: T.Optional(T.Array(organizationSchema))
})
```

### 2. Union Types for Polymorphism

```typescript
// Attendee can have different shapes (calendar.tb.ts line 25-38)
export const attendeeSchema = T.Intersect([
    T.Object({
        email: T.String(),
        original: T.Unknown()
    }),
    T.Union([  // Either has responseStatus OR self: true
        T.Object({
            responseStatus: T.Optional(attendeeResponseStatusSchema)
        }),
        T.Object({
            self: T.Literal(true)
        })
    ])
])
```

### 3. Nullable vs Optional

```typescript
// Optional: field may not exist
T.Optional(T.String())  // string | undefined

// Nullable: field exists but may be null
T.Union([T.String(), T.Null()])  // string | null

// Optional AND Nullable
T.Optional(T.Union([T.String(), T.Null()]))  // string | null | undefined
```

### 4. Unknown for Flexible Fields

```typescript
// Store original API response without validation
original: T.Unknown()  // Accepts any value

// Use when you need to preserve data you don't control
export const eventSchema = T.Object({
    id: T.String(),
    // ... validated fields ...
    original: T.Unknown()  // Preserves full API response
})
```

## Error Handling with TypeBox

### Validation Errors

When validation fails, TypeBox provides detailed error information:

```typescript
try {
    const user = Value.Parse(userSchema, invalidData)
} catch (error) {
    // TypeBox throws with validation details
    console.error('Validation failed:', error)
}

// Or get errors without throwing:
const errors = [...Value.Errors(userSchema, invalidData)]
errors.forEach(error => {
    console.log(`Path: ${error.path}`)
    console.log(`Message: ${error.message}`)
})
```

### FetchHelper Error Integration

The FetchHelper automatically handles validation errors:

```typescript
// In _fetch method (line 78-80)
if (!response.ok) throw new FetchError(url, response.status, response.statusText)
const data = await response.json()
if (schema !== undefined) return Value.Parse(schema, data)  // May throw validation error
```

Services can then handle these errors:

```typescript
public async get(id: string): Promise<User | null> {
    return this.fetchHelper
        .get(`/users/${id}`, { schema: userSchema })
        .catch(errorHandler([
            [404, () => null],  // Not found → return null
            // Validation errors bubble up
        ]))
}
```

## Performance Considerations

### 1. Schema Compilation

TypeBox schemas are compiled once and reused:

```typescript
// GOOD: Define schema once
const userSchema = T.Object({ ... })

// Use compiled schema multiple times
await fetchHelper.get('/users/1', { schema: userSchema })
await fetchHelper.get('/users/2', { schema: userSchema })
```

### 2. Lazy Validation

Only validate when necessary:

```typescript
// Only validate external data
const apiResponse = await fetchHelper.get(url, { schema })  // ✓ Validate

// Don't validate internal transformations
const entity = User.fromJson(apiResponse)  // No validation needed
```

### 3. Selective Field Validation

Use `T.Unknown()` for fields you don't need to validate:

```typescript
T.Object({
    id: T.String(),  // Validate critical fields
    metadata: T.Unknown()  // Skip validation for complex nested data
})
```

## Best Practices

### 1. Schema Naming Convention

```typescript
// Use 'Schema' suffix for clarity
export const userSchema = T.Object({ ... })
export const organizationSchema = T.Object({ ... })
```

### 2. Co-locate Related Schemas

```typescript
// Group related schemas in one file
// oauth.tb.ts
export const oauthConnectionSchema = T.Object({ ... })
export const oauthLinkSchema = T.Object({ ... })
```

### 3. Type Safety in Services

```typescript
// Always specify schema for type inference
const users = await this.fetchHelper.get('/users', {
    schema: T.Array(userSchema)  // ✓ Type-safe
})

// Avoid any/unknown returns
const data = await this.fetchHelper.get('/users', {})  // ✗ Returns void
```

### 4. Entity Factory Pattern

```typescript
// Use Static type in fromJson
static fromJson(json: Static<typeof userSchema>): User {
    // json is fully typed based on schema
    return new User({
        id: json.id,  // TypeScript knows these fields exist
        createdAt: json.createdAt,
        // Handle nested transformations
        organizations: json.organizations?.map(org => Organization.fromJson(org))
    })
}
```

## Common Pitfalls

### 1. Forgetting Static Import

```typescript
// WRONG: Missing Static import
const userSchema = T.Object({ ... })
type User = typeof userSchema  // This is the schema type, not the data type!

// CORRECT: Use Static
import type { Static } from '@sinclair/typebox'
type User = Static<typeof userSchema>  // Correct data type
```

### 2. Modifying Generated Schemas

```typescript
// NEVER edit .tb.ts files directly
// They are auto-generated and changes will be lost
```

### 3. Over-Validation

```typescript
// Don't validate data you just created
const user = new User({ id: '123', ... })
// No need to validate user - you just created it!
```

### 4. Schema/Type Mismatch

```typescript
// Keep TypeScript types and TypeBox schemas in sync
interface User {
    id: string
    email?: string  // Optional in TS
}

const userSchema = T.Object({
    id: T.String(),
    email: T.String()  // WRONG: Not optional in schema!
})

// CORRECT:
const userSchema = T.Object({
    id: T.String(),
    email: T.Optional(T.String())  // Matches TS interface
})
```

## Debugging TypeBox Issues

### 1. Check Schema Structure

```typescript
// Log schema to understand its structure
console.log(JSON.stringify(userSchema, null, 2))
```

### 2. Test Validation Separately

```typescript
// Isolate validation issues
const testData = { id: '123', createdAt: '2024-01-01' }
try {
    const valid = Value.Parse(userSchema, testData)
    console.log('Valid:', valid)
} catch (error) {
    console.error('Validation error:', error)
}
```

### 3. Use Value.Errors for Details

```typescript
const errors = [...Value.Errors(userSchema, data)]
errors.forEach(error => {
    console.log(`Field: ${error.path}`)
    console.log(`Expected: ${error.schema}`)
    console.log(`Received: ${error.value}`)
})
```

## Summary

TypeBox in the Recal SDK provides:

1. **Runtime Safety**: Validates all API responses
2. **Type Inference**: Automatic TypeScript types from schemas
3. **Developer Experience**: No manual type assertions
4. **Error Prevention**: Catches data issues early
5. **Performance**: Efficient validation with compiled schemas

The FetchHelper's generic magic combined with TypeBox schemas creates a type-safe bridge between your TypeScript code and external APIs, ensuring data integrity throughout your application.