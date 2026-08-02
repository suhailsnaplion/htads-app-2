import { Router } from 'express'
import { pool } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function nextCampaignId() {
  const n = Math.floor(2000 + Math.random() * 8000)
  return `CMP-${n}`
}

router.get('/', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC')
  res.json({ campaigns: result.rows })
})

router.get('/stats', requireAuth, async (req, res) => {
  const [active, spend, leads, channels] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM campaigns WHERE status = 'live'"),
    pool.query("SELECT COALESCE(SUM(spend_mtd),0)::numeric AS n FROM campaigns WHERE status = 'live'"),
    pool.query("SELECT COALESCE(SUM(leads),0)::int AS n FROM campaigns WHERE status = 'live'"),
    pool.query("SELECT COUNT(*)::int AS n FROM whatsapp_channels WHERE active = true"),
  ])
  res.json({
    activeCampaigns: active.rows[0].n,
    totalSpendMtd: Number(spend.rows[0].n),
    leadsToday: leads.rows[0].n,
    channelsLive: 5,
  })
})

router.get('/:id', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM campaigns WHERE id = $1', [req.params.id])
  if (!result.rows[0]) return res.status(404).json({ error: 'Campaign not found' })
  res.json({ campaign: result.rows[0] })
})

// Creates + launches a campaign from the wizard's CampaignFormData.
router.post('/', requireAuth, async (req, res) => {
  const formData = req.body
  if (!formData || !formData.campaignName) {
    return res.status(400).json({ error: 'campaignName is required' })
  }

  const id = nextCampaignId()
  const totalBudget = parseInt(String(formData.totalBudget || '0').replace(/,/g, ''), 10) || 0
  const channels = formData.selectedChannels || []

  const result = await pool.query(
    `INSERT INTO campaigns (id, name, business_unit, status, total_budget, spend_mtd, leads, channels, form_data, created_by, launched_at)
     VALUES ($1,$2,$3,'live',$4,0,0,$5,$6,$7, now())
     RETURNING *`,
    [id, formData.campaignName, formData.businessUnit, totalBudget, JSON.stringify(channels), JSON.stringify(formData), req.user.id]
  )

  res.status(201).json({ campaign: result.rows[0] })
})

export default router
