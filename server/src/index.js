import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureSchema } from './db/index.js'
import authRoutes from './routes/auth.js'
import campaignRoutes from './routes/campaigns.js'
import registryRoutes from './routes/registries.js'
import whatsappRoutes from './routes/whatsapp.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/registries', registryRoutes)
app.use('/api/whatsapp', whatsappRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Serve the built frontend (Vite build output) in production
const distPath = path.join(__dirname, '..', '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })
  res.sendFile(path.join(distPath, 'index.html'))
})

async function start() {
  try {
    await ensureSchema()
  } catch (err) {
    console.error('[startup] could not connect to database — check DATABASE_URL. Continuing so the server can still boot.', err.message)
  }
  app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`))
}

start()
