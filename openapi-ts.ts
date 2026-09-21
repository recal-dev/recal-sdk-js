import { readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@hey-api/openapi-ts'

const TRANSFORMERS_FILE = 'src/client/transformers.gen.ts'

const CALENDAR_STUB = `// Manual: HeyAPI couldn't generate transformer for Calendar schema
const calendarSchemaResponseTransformer = (data: any) => data;

`

/**
 * Re-inserts the Calendar transformer stub that HeyAPI fails to emit.
 *
 * HeyAPI emits a call to `<name>SchemaResponseTransformer` for every $ref'd
 * component, but only defines one for components carrying date fields.
 * `Calendar` has none, so the generated file calls a function it never declares
 * and does not compile.
 *
 * Idempotent, and a no-op once upstream either emits the definition or stops
 * emitting the call — so it can stay until the bug is fixed without rotting.
 */
function restoreCalendarTransformerStub(): void {
    const source = readFileSync(TRANSFORMERS_FILE, 'utf8')
    if (!source.includes('calendarSchemaResponseTransformer(')) return
    if (source.includes('const calendarSchemaResponseTransformer')) return

    const anchor = source.indexOf('export const ')
    if (anchor === -1) throw new Error(`Cannot place the Calendar stub: no export found in ${TRANSFORMERS_FILE}`)

    writeFileSync(TRANSFORMERS_FILE, source.slice(0, anchor) + CALENDAR_STUB + source.slice(anchor))
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

restoreCalendarTransformerStub()
