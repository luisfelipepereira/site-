import express from 'express'
import cors from 'cors'
import sql from './db.js'

const app = express()
const port = process.env.PORT || 3001

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL nao definida. Configure no arquivo .env.')
    process.exit(1)
}

if (process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    console.error('Substitua [YOUR-PASSWORD] pela senha real no arquivo .env.')
    process.exit(1)
}

app.use(cors())
app.use(express.json({ limit: '100kb' }))

const ensureTables = async () => {
    await sql`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id BIGSERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            mensagem TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `

    await sql`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id BIGSERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `
}

const isEmailValid = (email) => {
    if (typeof email !== 'string') return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

app.get('/api/health', (req, res) => {
    res.json({ ok: true })
})

app.post('/api/contact', async (req, res) => {
    try {
        const { nome, email, mensagem } = req.body || {}

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ error: 'Dados obrigatorios ausentes.' })
        }

        if (!isEmailValid(email)) {
            return res.status(400).json({ error: 'Email invalido.' })
        }

        await sql`
            INSERT INTO contact_messages (nome, email, mensagem)
            VALUES (${nome}, ${email}, ${mensagem})
        `

        return res.status(201).json({ ok: true })
    } catch (error) {
        console.error('Erro no contato:', error)
        return res.status(500).json({ error: 'Erro ao salvar mensagem.' })
    }
})

app.post('/api/newsletter', async (req, res) => {
    try {
        const { email } = req.body || {}

        if (!email) {
            return res.status(400).json({ error: 'Email obrigatorio.' })
        }

        if (!isEmailValid(email)) {
            return res.status(400).json({ error: 'Email invalido.' })
        }

        const result = await sql`
            INSERT INTO newsletter_subscribers (email)
            VALUES (${email})
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `

        if (!result.length) {
            return res.status(200).json({ ok: true, message: 'Email ja cadastrado.' })
        }

        return res.status(201).json({ ok: true })
    } catch (error) {
        console.error('Erro na newsletter:', error)
        return res.status(500).json({ error: 'Erro ao salvar email.' })
    }
})

const startServer = async () => {
    try {
        await ensureTables()
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`)
        })
    } catch (error) {
        console.error('Falha ao iniciar o servidor:', error)
        process.exit(1)
    }
}

startServer()

process.on('SIGINT', async () => {
    await sql.end({ timeout: 5 })
    process.exit(0)
})
