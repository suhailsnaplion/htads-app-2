import { Router } from 'express'
import { pool } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/bu', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM bu_registry ORDER BY code')
  res.json({ businessUnits: r.rows })
})

router.get('/whatsapp-channels', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT id, label, phone_number, business_unit FROM whatsapp_channels WHERE active = true ORDER BY label')
  res.json({ channels: r.rows })
})

router.get('/wa-templates', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM wa_templates WHERE approved = true ORDER BY id')
  res.json({ templates: r.rows })
})

router.get('/cohorts', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM cohorts ORDER BY created_at DESC')
  res.json({ cohorts: r.rows })
})

router.get('/placements', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM placements ORDER BY id')
  res.json({ placements: r.rows })
})

export default router
