import { useEffect, useState } from 'react'
import { api } from '../api'

const TABS = ['Category Registry', 'Placements Registry', 'Templates Registry', 'User Segments (Cohort) Registry']

const BU_FALLBACK = [
  { name: 'HTAuto', code: 'HTAU', active: true, cms: true, drr: true, adv: true, geo: 'National', owner: 'Ravi Sharma' },
  { name: 'HTTech', code: 'HTTC', active: true, cms: false, drr: false, adv: false, geo: 'National', owner: 'Meena Iyer' },
  { name: 'HTShopNow', code: 'HTSN', active: true, cms: true, drr: false, adv: false, geo: 'National', owner: 'Arun Pillai' },
  { name: 'Affiliates', code: 'AFFL', active: true, cms: false, drr: false, adv: false, geo: 'National', owner: 'Priya Kapoor' },
  { name: 'Education', code: 'EDUC', active: true, cms: true, drr: false, adv: false, geo: 'Metro Tier-1', owner: 'Sunita Rao' },
  { name: 'HT', code: 'HTMN', active: false, cms: false, drr: false, adv: false, geo: 'Pending', owner: 'TBD' },
  { name: 'LM', code: 'LMRE', active: false, cms: false, drr: false, adv: false, geo: 'Pending', owner: 'TBD' },
  { name: 'LH', code: 'LHLY', active: false, cms: false, drr: false, adv: false, geo: 'Pending', owner: 'TBD' },
]

const PLACEMENTS_FALLBACK = [
  { active: true, property: 'HTAuto Web', platform: 'WEB', rules: 'Max 2 per session', backend: 'htauto_web_top_banner' },
  { active: true, property: 'HTAuto Web', platform: 'MWEB', rules: 'Max 1 per session', backend: 'htauto_mweb_moa' },
  { active: true, property: 'HT Web', platform: 'WEB', rules: 'Max 3 per session', backend: 'ht_web_bottom_popup' },
  { active: true, property: 'HT App', platform: 'AOS', rules: 'Max 1 per session, interstitial', backend: 'htapp_aos_interstitial' },
  { active: false, property: 'LM Web', platform: 'WEB', rules: 'Pending config', backend: 'lm_web_placeholder' },
]

const TEMPLATES_FALLBACK = [
  { id: 'lead_confirmation_v2', placement: 'Top Banner', property: 'HTAuto Web', platform: 'WEB', dimensions: '970×90' },
  { id: 'otp_verification', placement: 'MOA', property: 'HT Web', platform: 'MWEB', dimensions: '320×480' },
  { id: 'offer_blast_diwali', placement: 'Interstitial', property: 'HT App', platform: 'AOS', dimensions: '360×640' },
  { id: 'lead_form_v3', placement: 'Bottom Popup', property: 'HTAuto Web', platform: 'WEB', dimensions: '600×300' },
]

const COHORTS_FALLBACK = [
  { name: 'HTAuto_HighIntent_Apr26', desc: 'Users who viewed ≥3 car pages in past 14 days', creator: 'Ravi Sharma', created: '12 Apr 2026' },
  { name: 'Realtime: Cart Abandoners', desc: 'Users who left checkout without completing in last 48h', creator: 'Meena Iyer', created: '01 Mar 2026' },
  { name: 'Education_Web_Leads_Q2', desc: 'Education vertical users who submitted a lead form in Q2', creator: 'Sunita Rao', created: '28 Jun 2026' },
  { name: 'Lookalike: Recent Purchasers', desc: 'Lookalike of users who purchased in last 90 days', creator: 'Arun Pillai', created: '15 May 2026' },
  { name: 'Realtime: Form Abandoners', desc: 'Users who opened but did not submit lead form in 24h', creator: 'Priya Kapoor', created: '22 Jul 2026' },
]

function Pill({ on }: { on: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
      background: on ? '#dcfce7' : '#fee2e2', color: on ? '#15803d' : '#dc2626',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
      {on ? 'On' : 'Off'}
    </span>
  )
}

export default function AdvancedSettings() {
  const [tab, setTab] = useState(0)
  const [buData, setBuData] = useState(BU_FALLBACK)
  const [placementsData, setPlacementsData] = useState(PLACEMENTS_FALLBACK)
  const [templatesData, setTemplatesData] = useState(TEMPLATES_FALLBACK)
  const [cohortsData, setCohortsData] = useState(COHORTS_FALLBACK)

  useEffect(() => {
    let cancelled = false

    api.buRegistry().then(res => {
      if (cancelled || !res.businessUnits?.length) return
      setBuData(res.businessUnits.map((b: any) => ({
        name: b.name, code: b.code, active: b.active,
        cms: b.cms_integration, drr: b.drr_applicable, adv: b.advanced_settings,
        geo: b.default_geography, owner: b.owner_name,
      })))
    }).catch(() => {})

    api.placements().then(res => {
      if (cancelled || !res.placements?.length) return
      setPlacementsData(res.placements.map((p: any) => ({
        active: p.active, property: p.property, platform: p.platform, rules: p.rules, backend: p.backend_name,
      })))
    }).catch(() => {})

    api.waTemplates().then(res => {
      if (cancelled || !res.templates?.length) return
      // Template registry rows also carry placement/property/platform/dimensions in the
      // static design catalogue; the DB is the source of truth for id + approved body/vars,
      // so we merge in the display-only columns from the fallback catalogue by id.
      const displayById = new Map(TEMPLATES_FALLBACK.map(t => [t.id, t]))
      setTemplatesData(res.templates.map((t: any) => {
        const display = displayById.get(t.id)
        return {
          id: t.id,
          placement: display?.placement || '—',
          property: display?.property || '—',
          platform: display?.platform || '—',
          dimensions: display?.dimensions || '—',
        }
      }))
    }).catch(() => {})

    api.cohorts().then(res => {
      if (cancelled || !res.cohorts?.length) return
      setCohortsData(res.cohorts.map((c: any) => ({
        name: c.id,
        desc: c.description,
        creator: c.creator_name,
        created: new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      })))
    }).catch(() => {})

    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', gap: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: '10px 12px', border: 'none',
            borderBottom: `2.5px solid ${tab === i ? '#1b3a6b' : 'transparent'}`,
            background: tab === i ? '#f0f5fb' : 'white',
            fontSize: 12.5, fontWeight: tab === i ? 700 : 500,
            color: tab === i ? '#0f2044' : '#64748b', cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>Category Registry</span>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Add BU</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['BU Name', 'BU Code', 'Active', 'CMS Integration', 'DRR Applicable', 'Adv. Settings', 'Default Geo Scope', 'Owner / Contact', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buData.map(row => (
                <tr key={row.code} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.name}</td>
                  <td style={{ padding: '9px 12px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#64748b' }}>{row.code}</span></td>
                  <td style={{ padding: '9px 12px' }}><Pill on={row.active} /></td>
                  <td style={{ padding: '9px 12px' }}><Pill on={row.cms} /></td>
                  <td style={{ padding: '9px 12px' }}><Pill on={row.drr} /></td>
                  <td style={{ padding: '9px 12px' }}><Pill on={row.adv} /></td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#334155' }}>{row.geo}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#334155' }}>{row.owner}</td>
                  <td style={{ padding: '9px 12px' }}><button className="btn-secondary" style={{ fontSize: 11, padding: '3px 9px' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 1 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>Placements Registry</span>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Add Placement</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Active', 'Property', 'Platform', 'Rules', 'Backend Name', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placementsData.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 12px' }}><Pill on={r.active} /></td>
                  <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.property}</td>
                  <td style={{ padding: '9px 12px' }}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11.5, fontWeight: 600, color: '#475569' }}>{r.platform}</span></td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#64748b' }}>{r.rules}</td>
                  <td style={{ padding: '9px 12px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#334155' }}>{r.backend}</span></td>
                  <td style={{ padding: '9px 12px' }}><button className="btn-secondary" style={{ fontSize: 11, padding: '3px 9px' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 2 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>Templates Registry</span>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Add Template</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Template ID', 'Placement', 'Property', 'Platform', 'Dimensions', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templatesData.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 12px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#1b3a6b', fontWeight: 600 }}>{r.id}</span></td>
                  <td style={{ padding: '9px 12px', fontSize: 12.5, color: '#334155' }}>{r.placement}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12.5, color: '#334155' }}>{r.property}</td>
                  <td style={{ padding: '9px 12px' }}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11.5, fontWeight: 600, color: '#475569' }}>{r.platform}</span></td>
                  <td style={{ padding: '9px 12px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#64748b' }}>{r.dimensions}</span></td>
                  <td style={{ padding: '9px 12px' }}><button className="btn-secondary" style={{ fontSize: 11, padding: '3px 9px' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 3 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>User Segments (Cohort) Registry</span>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Add Segment</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Segment Name', 'Description', 'Creator', 'Created', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortsData.map(r => (
                <tr key={r.name} style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 12px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#1b3a6b', fontWeight: 600 }}>{r.name}</span></td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#64748b', maxWidth: 320 }}>{r.desc}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12.5, color: '#334155' }}>{r.creator}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#94a3b8' }}>{r.created}</td>
                  <td style={{ padding: '9px 12px' }}><button className="btn-secondary" style={{ fontSize: 11, padding: '3px 9px' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
