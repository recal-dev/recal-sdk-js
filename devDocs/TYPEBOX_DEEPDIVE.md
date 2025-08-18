# TypeBox Deep Dive

## Quick Understanding

TypeBox bridges TypeScript's compile-time types with runtime validation. In the Recal SDK, it ensures API responses match expected schemas, catching errors before they crash your app.

**The Flow:**
```
API Response → TypeBox Validation → Type-Safe Data → Entity Classes
```

## Essential Patterns

### Basic Schema Building

```typescript
import { Type as T } from '@sinclair/typebox'

// Primitives
T.String()                              // string
T.Number()                              // number  
T.Boolean()                             // boolean
T.Date()                                // Date

// Objects
T.Object({
    id: T.String(),
    createdAt: T.Date()
})

// Arrays
T.Array(userSchema)                     // User[]

// Optional fields
T.Optional(T.String())                  // string | undefined

// Union types (enums)
T.Union([
    T.Literal('google'),
    T.Literal('microsoft')
])                                       // 'google' | 'microsoft'
```

### Type Inference with Static

`Static` extracts TypeScript types from schemas:

```typescript
import type { Static } from '@sinclair/typebox'

const userSchema = T.Object({
    id: T.String(),
    email: T.String(),
    createdAt: T.Date()
})

// Automatic type inference:
type User = Static<typeof userSchema>
// Result: { id: string; email: string; createdAt: Date }
```

### Runtime Validation

```typescript
import { Value } from '@sinclair/typebox/value'

// Parse (used in FetchHelper) - throws on invalid data
const user = Value.Parse(userSchema, apiResponse)

// Check - boolean validation without throwing
if (Value.Check(userSchema, data)) {
    // data matches schema
}

// Debug validation errors
const errors = [...Value.Errors(userSchema, data)]
```

## How It Works in Practice

### FetchHelper's Type Magic

The FetchHelper automatically infers types from schemas:

```typescript
// When you pass a schema:
await fetchHelper.get('/api/users', {
    schema: T.Array(userSchema)  // TypeBox schema
})
// Returns: User[] (fully typed!)

// Behind the scenes in FetchHelper:
if (schema !== undefined) {
    return Value.Parse(schema, data)  // Validates & returns typed data
}
```

**The magic:** Schema → Runtime Validation → TypeScript Type Inference

## Real Service Implementation

### Complete Flow Example

```typescript
// 1. Schema Definition (auto-generated in .tb.ts)
export const userSchema = T.Object({
    id: T.String(),
    createdAt: T.Date(),
    organizations: T.Optional(T.Array(organizationSchema))
})

// 2. Service Method (actual code from users.service.ts)
public async listAll(): Promise<User[]> {
    return this.fetchHelper
        .get('/v1/users', { 
            schema: T.Array(userSchema)  // Validates response
        })
        .then((users) => users.map(User.fromJson))  // Transform to entities
}

// 3. What happens:
// - API returns JSON
// - TypeBox validates structure
// - TypeScript knows the exact type
// - Entity classes add behavior
```

### Inline vs Pre-defined Schemas

```typescript
// Inline for simple responses
await fetchHelper.get(url, {
    schema: T.Object({ url: T.String() })  
})

// Pre-defined for complex types
await fetchHelper.get(url, {
    schema: oauthConnectionSchema
})
```

## Common Schema Patterns

### Optional vs Nullable

```typescript
// Field may not exist
T.Optional(T.String())  // string | undefined

// Field exists but may be null  
T.Union([T.String(), T.Null()])  // string | null

// Both optional and nullable
T.Optional(T.Union([T.String(), T.Null()]))  // string | null | undefined
```

### Union Types (Either/Or)

```typescript
// From actual attendee schema
T.Union([
    T.Object({ responseStatus: T.Optional(responseStatusSchema) }),
    T.Object({ self: T.Literal(true) })
])
// Result: Has EITHER responseStatus OR self:true
```

### Preserving Unknown Data

```typescript
T.Object({
    id: T.String(),  // Validated fields
    original: T.Unknown()  // Preserve raw API response
})
```

## Error Handling

### When Validation Fails

```typescript
// FetchHelper throws on invalid data
try {
    await fetchHelper.get('/api/user', { schema: userSchema })
} catch (error) {
    // TypeBox validation error with details
}

// Services handle with errorHandler
return this.fetchHelper
    .get(`/users/${id}`, { schema: userSchema })
    .catch(errorHandler([
        { code: 404, result: null },  // HTTP errors
        // Validation errors bubble up automatically
    ]))
```

### Debugging Validation

```typescript
// Get detailed error information
const errors = [...Value.Errors(schema, data)]
errors.forEach(err => {
    console.log(`Field: ${err.path}, Issue: ${err.message}`)
})
```

## Performance Tips

### Schema Reuse
```typescript
// ✅ Define once, use many times
const userSchema = T.Object({ ... })

// ❌ Don't recreate schemas
await fetchHelper.get(url, { 
    schema: T.Object({ ... })  // Creates new schema each time
})
```

### Selective Validation
```typescript
T.Object({
    id: T.String(),  // Validate critical fields
    metadata: T.Unknown()  // Skip complex nested data
})
```

## Best Practices

### ✅ DO

```typescript
// Use Static for type extraction
type User = Static<typeof userSchema>

// Pass schemas for type safety
await fetchHelper.get('/users', { schema: userSchema })

// Use fromJson pattern with Static
static fromJson(json: Static<typeof userSchema>): User {
    return new User(json)
}
```

### ❌ DON'T

```typescript
// Don't edit .tb.ts files (auto-generated)
// Don't use typeof schema as the data type
type User = typeof userSchema  // Wrong! This is the schema type

// Don't skip schemas for external data
await fetchHelper.get('/users', {})  // No type safety!
```

## Common Pitfalls & Solutions

### Schema/Type Mismatch
```typescript
// TypeScript interface
interface User {
    email?: string  // Optional
}

// ❌ Schema doesn't match
T.Object({ email: T.String() })  // Required!

// ✅ Correct schema
T.Object({ email: T.Optional(T.String()) })
```

### Using typeof Instead of Static
```typescript
// ❌ Wrong - gets schema type, not data type
type User = typeof userSchema

// ✅ Correct - gets data type
type User = Static<typeof userSchema>
```

## Quick Debugging Guide

```typescript
// 1. Test validation in isolation
const testData = { /* your data */ }
try {
    Value.Parse(schema, testData)
    console.log('✅ Valid')
} catch (error) {
    console.error('❌ Invalid:', error)
}

// 2. Get detailed errors
const errors = [...Value.Errors(schema, data)]
errors.forEach(err => {
    console.log(`${err.path}: expected ${err.type}, got ${err.value}`)
})

// 3. Check schema structure
console.log(JSON.stringify(schema, null, 2))
```

## Key Takeaways

### What TypeBox Gives You

1. **Automatic Type Safety**: Pass schema → get typed data
2. **Runtime Validation**: Catch API changes before they break your app
3. **Zero Type Assertions**: TypeScript knows everything
4. **Better DX**: Autocomplete works perfectly with validated data

### The Complete Flow

```typescript
API Response → FetchHelper + Schema → Validated & Typed Data → Entity Class → Your App
```

Every step is type-safe, validated, and automatic. You just define schemas and use them.