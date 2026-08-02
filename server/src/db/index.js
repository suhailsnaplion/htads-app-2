import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.error('[db] DATABASE_URL is not set. Set it to a Postgres connection string (Render provides one when you add a Postgres instance).')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : (process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined),
})

export async function query(text, params) {
  return pool.query(text, params)
}

export async function ensureSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('[db] schema ensured')
}
