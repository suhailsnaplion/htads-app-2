import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const CAMPAIGNS = [
  { id: 'CMP-2291', name: 'Honda City — Q3 Lead Gen', business_unit: 'HTAuto', status: 'live', total_budget: 800000, spend_mtd: 324100, leads: 1842, channels: ['Echo', 'DSP', 'WhatsApp'] },
  { id: 'CMP-2290', name: 'Mahindra XUV700 Launch', business_unit: 'HTAuto', status: 'live', total_budget: 1250000, spend_mtd: 786200, leads: 3104, channels: ['Echo', 'DSP', 'Voice AI', 'Meta'] },
  { id: 'CMP-2289', name: 'NIIT PG Diploma — Data Science', business_unit: 'Education', status: 'live', total_budget: 240000, spend_mtd: 91300, leads: 617, channels: ['DSP', 'WhatsApp'] },
  { id: 'CMP-2288', name: 'Myntra Diwali Fashion Push', business_unit: 'Affiliates', status: 'at_risk', total_budget: 560000, spend_mtd: 551800, leads: 0, channels: ['Echo', 'DSP'] },
  { id: 'CMP-2287', name: 'Kia Seltos Q2 Retargeting', business_unit: 'HTAuto', status: 'paused', total_budget: 320000, spend_mtd: 112400, leads: 729, channels: ['DSP'] },
  { id: 'CMP-2286', name: 'Honda Elevate — Delhi NCR', business_unit: 'HTAuto', status: 'draft', total_budget: 480000, spend_mtd: 0, leads: 0, channels: ['Echo', 'WhatsApp', 'Voice AI'] },
  { id: 'CMP-2285', name: 'LM Real Estate — Pune', business_unit: 'LM', status: 'draft', total_budget: 180000, spend_mtd: 0, leads: 0, channels: ['DSP', 'WhatsApp'] },
]

const STATS = {
  activeCampaigns: 3,
  activeCampaignsDelta: '↑ 2 vs last week',
  totalSpendMtd: 1765800,
  totalSpendMtdNote: '68% of monthly budget',
  leadsToday: 284,
  leadsTodayDelta: '↑ 12% vs yesterday',
  channelsLive: 5,
  channelsLiveTotal: 5,
  channelsLiveNote: 'All channels operational',
  channelThroughput: { Echo: 198, DSP: 61, WhatsApp: 14, 'Voice AI': 11, Meta: 0 },
}

router.get('/', requireAuth, async (req, res) => { res.json({ campaigns: CAMPAIGNS }) })
router.get('/stats', requireAuth, async (req, res) => { res.json(STATS) })
router.get('/:id', requireAuth, async (req, res) => {
  const campaign = CAMPAIGNS.find(c => c.id === req.params.id)
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' })
  res.json({ campaign })
})
router.post('/', requireAuth, async (req, res) => {
  const formData = req.body
  if (!formData || !formData.campaignName) return res.status(400).json({ error: 'campaignName is required' })
  const id = `CMP-${Math.floor(2000 + Math.random() * 8000)}`
  res.status(201).json({ campaign: { id, name: formData.campaignName, business_unit: formData.businessUnit, status: 'live' } })
})

export default router
