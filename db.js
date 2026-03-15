import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
    ssl: 'require'
})

export default sql
