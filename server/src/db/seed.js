import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool, ensureSchema } from './index.js'

const WA_CHANNELS = [
  { id: 'wa_htauto_primary', label: 'HTAuto — Primary', number: '9876543210', bu: 'HTAuto' },
  { id: 'wa_htauto_secondary', label: 'HTAuto — Secondary', number: '9876543211', bu: 'HTAuto' },
  { id: 'wa_httech', label: 'HTTech', number: '9876543212', bu: 'HTTech' },
  { id: 'wa_htshopnow', label: 'HTShopNow', number: '9876543213', bu: 'HTShopNow' },
  { id: 'wa_affiliates', label: 'Affiliates', number: '9876543214', bu: 'Affiliates' },
  { id: 'wa_education', label: 'Education', number: '9876543215', bu: 'Education' },
  { id: 'wa_ht_corporate', label: 'HT — Corporate', number: '9876543216', bu: 'HT' },
  { id: 'wa_lm_business', label: 'LM — Business', number: '9876543217', bu: 'LM' },
  { id: 'wa_lh_hindi', label: 'LH — Hindi', number: '9876543218', bu: 'LH' },
  { id: 'wa_promotions', label: 'Promotions & Offers', number: '9876543219', bu: null },
]

const BU_DATA = [
  { code: 'HTAU', name: 'HTAuto', active: true, cms: true, drr: true, adv: true, geo: 'National', owner: 'Ravi Sharma' },
  { code: 'HTTC', name: 'HTTech', active: true, cms: false, drr: false, adv: false, geo: 'National', owner: 'Meena Iyer' },
  { code: 'HTSN', name: 'HTShopNow', active: true, cms: true, drr: false, adv: false, geo: 'National', owner: 'Arun Pillai' },
  { code: 'AFFL', name: 'Affiliates', active: true, cms: false, drr: false, adv: false, geo: 'National', owner: 'Priya Kapoor' },
  { code: 'EDUC', name: 'Education', active: true, cms: true, drr: false, adv: false, geo: 'Metro Tier-1', owner: 'Sunita Rao' },
  { code: 'HTMN', name: 'HT', active: false, cms: false, drr: false, adv: false, geo: 'Pending', owner: 'TBD' },
  { code: 'LMRE', name: 'LM', active: false, cms: false, drr: false, adv: false, geo: 'Pending', owner: 'TBD' },
  { code: 'LHLY', name: 'LH', active: false, cms: false, drr: false, adv: false, geo: 'Pending', owner: 'TBD' },
]

const TEMPLATES = [
  { id: 'lead_confirmation_v2', body: 'Hi {{1}}, thanks for your interest in {{2}}. Our team will contact you within {{3}} hours.', vars: ['Customer name', 'Model name', 'Response hours'] },
  { id: 'otp_verification', body: 'Your OTP for verifying interest in {{1}} is {{2}}. Valid for 10 minutes.', vars: ['Model name', 'OTP code'] },
  { id: 'offer_blast_diwali', body: 'Hi {{1}}, exclusive Diwali offer on {{2}} — get up to {{3}}% off. Visit your nearest dealer today.', vars: ['Customer name', 'Model name', 'Discount %'] },
]

const COHORTS = [
  { id: 'HTAuto_HighIntent_Apr26', desc: 'Users who viewed \u22653 car pages in past 14 days', creator: 'Ravi Sharma' },
  { id: 'Realtime: Cart Abandoners', desc: 'Users who left checkout without completing in last 48h', creator: 'Meena Iyer' },
  { id: 'Education_Web_Leads_Q2', desc: 'Education vertical users who submitted a lead form in Q2', creator: 'Sunita Rao' },
  { id: 'Lookalike: Recent Purchasers', desc: 'Lookalike of users who purchased in last 90 days', creator: 'Arun Pillai' },
  { id: 'Realtime: Form Abandoners', desc: 'Users who opened but did not submit lead form in 24h', creator: 'Priya Kapoor' },
]

const PLACEMENTS = [
  { property: 'HTAuto Web', platform: 'WEB', rules: 'Max 2 per session', backend_name: 'htauto_web_top_banner', active: true },
  { property: 'HTAuto Web', platform: 'MWEB', rules: 'Max 1 per session', backend_name: 'htauto_mweb_moa', active: true },
  { property: 'HT Web', platform: 'WEB', rules: 'Max 3 per session', backend_name: 'ht_web_bottom_popup', active: true },
  { property: 'HT App', platform: 'AOS', rules: 'Max 1 per session, interstitial', backend_name: 'htapp_aos_interstitial', active: true },
  { property: 'LM Web', platform: 'WEB', rules: 'Pending config', backend_name: 'lm_web_placeholder', active: false },
]

async function main() {
  await ensureSchema()

  // --- Users ---
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'HtAds@2026'
  const hash = await bcrypt.hash(defaultPassword, 10)
  const users = [
    { name: 'Priya Kapoor', email: 'priya.kapoor@hindustantimes.com', role: 'Campaign Manager' },
    { name: 'Ravi Sharma', email: 'ravi.sharma@hindustantimes.com', role: 'Ops Admin' },
  ]
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO NOTHING`,
      [u.name, u.email, hash, u.role]
    )
  }

  // --- BU registry ---
  for (const b of BU_DATA) {
    await pool.query(
      `INSERT INTO bu_registry (code, name, active, cms_integration, drr_applicable, advanced_settings, default_geography, owner_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (code) DO UPDATE SET name=$2, active=$3, cms_integration=$4, drr_applicable=$5, advanced_settings=$6, default_geography=$7, owner_name=$8`,
      [b.code, b.name, b.active, b.cms, b.drr, b.adv, b.geo, b.owner]
    )
  }

  // --- WhatsApp channels ---
  for (const c of WA_CHANNELS) {
    await pool.query(
      `INSERT INTO whatsapp_channels (id, label, phone_number, business_unit, active)
       VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (id) DO UPDATE SET label=$2, phone_number=$3, business_unit=$4`,
      [c.id, c.label, c.number, c.bu]
    )
  }

  // --- Templates ---
  for (const t of TEMPLATES) {
    await pool.query(
      `INSERT INTO wa_templates (id, body, vars, approved) VALUES ($1,$2,$3,true)
       ON CONFLICT (id) DO UPDATE SET body=$2, vars=$3`,
      [t.id, t.body, JSON.stringify(t.vars)]
    )
  }

  // --- Cohorts ---
  for (const c of COHORTS) {
    await pool.query(
      `INSERT INTO cohorts (id, description, creator_name) VALUES ($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET description=$2, creator_name=$3`,
      [c.id, c.desc, c.creator]
    )
  }

  // --- Placements ---
  const existingPlacements = await pool.query('SELECT COUNT(*)::int AS n FROM placements')
  if (existingPlacements.rows[0].n === 0) {
    for (const p of PLACEMENTS) {
      await pool.query(
        `INSERT INTO placements (property, platform, rules, backend_name, active) VALUES ($1,$2,$3,$4,$5)`,
        [p.property, p.platform, p.rules, p.backend_name, p.active]
      )
    }
  }

  // --- Sample campaigns (only if table empty, so re-running seed doesn't duplicate) ---
  const existingCampaigns = await pool.query('SELECT COUNT(*)::int AS n FROM campaigns')
  if (existingCampaigns.rows[0].n === 0) {
    const priya = await pool.query('SELECT id FROM users WHERE email = $1', ['priya.kapoor@hindustantimes.com'])
    const createdBy = priya.rows[0]?.id || null
    const samples = [
      { id: 'CMP-2291', name: 'Honda City — Q3 Lead Gen', bu: 'HTAuto', status: 'live', budget: 800000, spend: 324100, leads: 1842, channels: ['Echo', 'DSP', 'WhatsApp'] },
      { id: 'CMP-2290', name: 'Mahindra XUV700 Launch', bu: 'HTAuto', status: 'live', budget: 1250000, spend: 786200, leads: 3104, channels: ['Echo', 'DSP', 'Voice AI', 'Meta'] },
      { id: 'CMP-2289', name: 'NIIT PG Diploma — Data Science', bu: 'Education', status: 'live', budget: 240000, spend: 91300, leads: 617, channels: ['DSP', 'WhatsApp'] },
      { id: 'CMP-2288', name: 'Myntra Diwali Fashion Push', bu: 'Affiliates', status: 'at_risk', budget: 560000, spend: 551800, leads: 0, channels: ['Echo', 'DSP'] },
      { id: 'CMP-2287', name: 'Kia Seltos Q2 Retargeting', bu: 'HTAuto', status: 'paused', budget: 320000, spend: 112400, leads: 729, channels: ['Echo'] },
    ]
    for (const s of samples) {
      await pool.query(
        `INSERT INTO campaigns (id, name, business_unit, status, total_budget, spend_mtd, leads, channels, form_data, created_by, launched_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())`,
        [s.id, s.name, s.bu, s.status, s.budget, s.spend, s.leads, JSON.stringify(s.channels), JSON.stringify({ campaignName: s.name, businessUnit: s.bu }), createdBy]
      )
    }
  }

  console.log('[seed] complete.')
  console.log(`[seed] Login with: priya.kapoor@hindustantimes.com / ${defaultPassword}  (change this after first login)`)
  await pool.end()
}

main().catch(err => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
