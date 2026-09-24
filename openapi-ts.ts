import { readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@hey-api/openapi-ts'

const TRANSFORMERS_FILE = 'src/client/transformers.gen.ts'

/**
 * Component schemas with no date fields, for which HeyAPI omits the
 * transformer definition below despite emitting calls to it.
 */
const SCHEMAS_MISSING_TRANSFORMERS = [
    'calendarSchemaResponseTransformer',
    'failedFreeBusyUserSchemaResponseTransformer',
]

/**
 * Re-inserts the transformer stubs that HeyAPI fails to emit for schemas with
 * no date fields.
 *
 * HeyAPI emits a call to `<name>SchemaResponseTransformer` for every $ref'd
 * component, but only defines one for components carrying date fields. A
 * component with none, e.g. `Calendar` or `FailedFreeBusyUser`, gets a call
 * the generated file never declares, and it does not compile.
 *
 * Idempotent, and a no-op once upstream either emits the definition or stops
 * emitting the call — so it can stay until the bug is fixed without rotting.
 */
function restoreMissingTransformerStubs(): void {
    const source = readFileSync(TRANSFORMERS_FILE, 'utf8')
    const missing = SCHEMAS_MISSING_TRANSFORMERS.filter(
        (name) => source.includes(`${name}(`) && !source.includes(`const ${name}`)
    )
    if (missing.length === 0) return

    const anchor = source.indexOf('export const ')
    if (anchor === -1) throw new Error(`Cannot place transformer stubs: no export found in ${TRANSFORMERS_FILE}`)

    const stubs = missing
        .map(
            (name) =>
                `// Manual: HeyAPI couldn't generate a transformer for this schema\nconst ${name} = (data: any) => data;\n\n`
        )
        .join('')

    writeFileSync(TRANSFORMERS_FILE, source.slice(0, anchor) + stubs + source.slice(anchor))
}

await createClient({
    input: process.env.RECAL_OPENAPI_URL ?? 'http://localhost:8080/v1/openapi.json',
    output: 'src/client',
    plugins: [
        {
            name: 'zod',
            dates: { offset: true },
        },
        {
            name: '@hey-api/transformers',
            dates: true,
        },
        {
            name: '@hey-api/sdk',
            validator: true,
            transformer: true,
        },
    ],
})

restoreMissingTransformerStubs()
