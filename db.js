import dns from 'node:dns'
import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config()

dns.setDefaultResultOrder('ipv4first')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL nao definida.')
}

const url = new URL(connectionString)
const hostname = url.hostname

let resolvedHost = hostname
try {
    const lookup = await dns.promises.lookup(hostname, { family: 4 })
    resolvedHost = lookup.address
} catch (error) {
    console.warn('Falha ao resolver IPv4, usando hostname original.', error)
}

const sql = postgres(connectionString, {
    host: resolvedHost,
    ssl: {
        servername: hostname
    }
})

export default sql
