import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const BU_REGISTRY = [
  { code: 'HTAU', name: 'HTAuto', active: true, cms_integration: true, drr_applicable: true, advanced_settings: true, default_geography: 'National', owner_name: 'Ravi Sharma' },
  { code: 'HTTC', name: 'HTTech', active: true, cms_integration: false, drr_applicable: false, advanced_settings: false, default_geography: 'National', owner_name: 'Meena Iyer' },
  { code: 'HTSN', name: 'HTShopNow', active: true, cms_integration: true, drr_applicable: false, advanced_settings: false, default_geography: 'National', owner_name: 'Arun Pillai' },
  { code: 'AFFL', name: 'Affiliates', active: true, cms_integration: false, drr_applicable: false, advanced_settings: false, default_geography: 'National', owner_name: 'Priya Kapoor' },
  { code: 'EDUC', name: 'Education', active: true, cms_integration: true, drr_applicable: false, advanced_settings: false, default_geography: 'Metro Tier-1', owner_name: 'Sunita Rao' },
  { code: 'HTMN', name: 'HT', active: false, cms_integration: false, drr_applicable: false, advanced_settings: false, default_geography: 'Pending', owner_name: 'TBD' },
  { code: 'LMRE', name: 'LM', active: false, cms_integration: false, drr_applicable: false, advanced_settings: false, default_geography: 'Pending', owner_name: 'TBD' },
  { code: 'LHLY', name: 'LH', active: false, cms_integration: false, drr_applicable: false, advanced_settings: false, default_geography: 'Pending', owner_name: 'TBD' },
]

const WHATSAPP_CHANNELS = [
  { id: 'wa_htauto_primary', label: 'HTAuto — Primary', phone_number: '9876543210' },
  { id: 'wa_htauto_secondary', label: 'HTAuto — Secondary', phone_number: '9876543211' },
  { id: 'wa_httech', label: 'HTTech', phone_number: '9876543212' },
  { id: 'wa_htshopnow', label: 'HTShopNow', phone_number: '9876543213' },
  { id: 'wa_affiliates', label: 'Affiliates', phone_number: '9876543214' },
  { id: 'wa_education', label: 'Education', phone_number: '9876543215' },
  { id: 'wa_ht_corporate', label: 'HT — Corporate', phone_number: '9876543216' },
  { id: 'wa_lm_business', label: 'LM — Business', phone_number: '9876543217' },
  { id: 'wa_lh_hindi', label: 'LH — Hindi', phone_number: '9876543218' },
  { id: 'wa_promotions', label: 'Promotions & Offers', phone_number: '9876543219' },
]

const WA_TEMPLATES = [
  { id: 'lead_confirmation_v2', body: 'Hi {{1}}, thanks for your interest in {{2}}. Our team will contact you within {{3}} hours.', vars: ['Customer name', 'Model name', 'Response hours'] },
  { id: 'otp_verification', body: 'Your OTP for verifying interest in {{1}} is {{2}}. Valid for 10 minutes.', vars: ['Model name', 'OTP code'] },
  { id: 'offer_blast_diwali', body: 'Hi {{1}}, exclusive Diwali offer on {{2}} — get up to {{3}}% off. Visit your nearest dealer today.', vars: ['Customer name', 'Model name', 'Discount %'] },
]

const COHORTS = [
  { id: 'HTAuto_HighIntent_Apr26', description: 'Users who viewed ≥3 car pages in past 14 days', creator_name: 'Ravi Sharma', created_at: '2026-04-12T00:00:00Z' },
  { id: 'Realtime: Cart Abandoners', description: 'Users who left checkout without completing in last 48h', creator_name: 'Meena Iyer', created_at: '2026-03-01T00:00:00Z' },
  { id: 'Education_Web_Leads_Q2', description: 'Education vertical users who submitted a lead form in Q2', creator_name: 'Sunita Rao', created_at: '2026-06-28T00:00:00Z' },
  { id: 'Lookalike: Recent Purchasers', description: 'Lookalike of users who purchased in last 90 days', creator_name: 'Arun Pillai', created_at: '2026-05-15T00:00:00Z' },
  { id: 'Realtime: Form Abandoners', description: 'Users who opened but did not submit lead form in 24h', creator_name: 'Priya Kapoor', created_at: '2026-07-22T00:00:00Z' },
]

const PLACEMENTS = [
  { property: 'HTAuto Web', platform: 'WEB', rules: 'Max 2 per session', backend_name: 'htauto_web_top_banner', active: true },
  { property: 'HTAuto Web', platform: 'MWEB', rules: 'Max 1 per session', backend_name: 'htauto_mweb_moa', active: true },
  { property: 'HT Web', platform: 'WEB', rules: 'Max 3 per session', backend_name: 'ht_web_bottom_popup', active: true },
  { property: 'HT App', platform: 'AOS', rules: 'Max 1 per session, interstitial', backend_name: 'htapp_aos_interstitial', active: true },
  { property: 'LM Web', platform: 'WEB', rules: 'Pending config', backend_name: 'lm_web_placeholder', active: false },
]

router.get('/bu', requireAuth, (req, res) => res.json({ businessUnits: BU_REGISTRY }))
router.get('/whatsapp-channels', requireAuth, (req, res) => res.json({ channels: WHATSAPP_CHANNELS }))
router.get('/wa-templates', requireAuth, (req, res) => res.json({ templates: WA_TEMPLATES }))
router.get('/cohorts', requireAuth, (req, res) => res.json({ cohorts: COHORTS }))
router.get('/placements', requireAuth, (req, res) => res.json({ placements: PLACEMENTS }))

export default router
