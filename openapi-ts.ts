import { createClient } from '@hey-api/openapi-ts'

createClient({
    input: 'http://localhost:8080/v1/openapi.json',
    output: 'src/client',
    plugins: [
        {
            name: 'zod',
            dates: { offset: true },
        },
        {
            name: '@hey-api/sdk',
            validator: true,
        },
        {
            name: '@hey-api/transformers',
            dates: true,
        },
    ],
})
