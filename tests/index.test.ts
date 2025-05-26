import Recal from '../src'

const test = new Recal({
    token: 'recal_EvObocvasKJD_k0-YeJSaMG5x3EaezgUj7uzpxnCJNP6J61KLQWakP9bZUOxnr2NlMn48LyjTCx9B_P4kr1CLS5hCZnyl6Bl-GCJhXV6JvmTceWl5DK01bc0EEOG.cIctkTDVxuZYGDcG8QjLRFdZYlTx23suXlfBJDJOMRY',
    baseURL: 'http://localhost:8080',
})
const start = performance.now()
test.organizations.list().then((organizations) => {
    console.log(organizations)
    console.log(`Took ${Math.round((performance.now() - start) * 10) / 10}ms`)
})
