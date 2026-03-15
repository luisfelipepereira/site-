import dns from 'node:dns'
import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config()

dns.setDefaultResultOrder('ipv4first')

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
    ssl: 'require'
})

export default sql
