import { RecalClient } from './src/index'

const recalClient = new RecalClient({
    token: 'recal_1234567890',
})

const connections = await recalClient.oauth.getAllConnections('1234567890')
console.log(connections)
