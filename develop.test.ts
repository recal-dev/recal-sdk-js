import { RecalClient } from './src/index'

const recalClient = new RecalClient({
    token: process.env.RECAL_TOKEN,
    url: process.env.RECAL_URL,
})
