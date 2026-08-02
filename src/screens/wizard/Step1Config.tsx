import { useState } from 'react'
import Badge from '../../components/Badge'
import Toggle from '../../components/Toggle'
import type { CampaignFormData } from '../../types'

interface Props {
  data: CampaignFormData
  onChange: (patch: Partial<CampaignFormData>) => void
}

const BUS = ['HTAuto', 'HTTech', 'HTShopNow', 'Affiliates', 'Education', 'HT', 'LM', 'LH']
const OBJECTIVES = ['CPL – Cost per Lead', 'CPQL – Cost per Qualified Lead', 'CPS – Cost per Sale', 'CPA – Cost per Action', 'CPM – Cost per 1000 Impressions', 'CPC – Cost per Click']
const STATES: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  'Delhi NCR': ['New Delhi', 'Gurugram', 'Noida'],
  Karnataka: ['Bengaluru', 'Mysuru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
}
const HTAUTO_MODELS: Record<string, string[]> = {
  'Honda Cars India': ['City', 'Amaze', 'Elevate'],
  'Mahindra & Mahindra': ['XUV700', 'Scorpio-N', 'Thar'],
  'Kia India': ['Seltos', 'Sonet', 'Carens'],
}
const COMPETITORS = ['Maruti Baleno', 'Hyundai Verna', 'Tata Nexon', 'Toyota Glanza']
const DUPE_KEYS = ['Phone Number', 'Model', 'City', 'Dealer ID', 'Brand']

function FieldRow({ label, badge, children }: { label: string; badge: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="field-row">
      <div className="field-label">{label} {badge}</div>
      <div>{children}</div>
    </div>
  )
}

function SectionCard({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {accent && <span style={{ width: 3, height: 14, borderRadius: 2, background: accent, display: 'inline-block' }} />}
          <span className="section-card-title">{title}</span>
        </div>
      </div>
      <div className="section-card-body">{children}</div>
    </div>
  )
}

function ChipMultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 2 }}>
      {options.map(o => (
        <span key={o} className={`chip ${selected.includes(o) ? 'selected' : ''}`} onClick={() => toggle(o)}>{o}</span>
      ))}
    </div>
  )
}

export default function Step1Config({ data, onChange }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  void expandedSection; void setExpandedSection

  const bu = data.businessUnit
  const obj = data.objective
  const showAgencyCode = data.dealType === 'Agency'
  const showActionType = obj === 'CPA – Cost per Action'
  const showDRR = bu === 'HTAuto' && (obj.startsWith('CPL') || obj.startsWith('CPQL'))

  const objLabel = () => {
    if (obj.startsWith('CPL')) return 'Price per Lead'
    if (obj.startsWith('CPQL')) return 'Price per Qualified Lead'
    if (obj.startsWith('CPS')) return 'Price per Sale'
    if (obj.startsWith('CPA')) return 'Price per Action'
    if (obj.startsWith('CPM')) return 'Price per 1,000 Impressions'
    if (obj.startsWith('CPC')) return 'Price per Click'
    return 'Unit Price'
  }

  const volLabel = () => {
    if (obj.startsWith('CPL')) return 'Target leads'
    if (obj.startsWith('CPQL')) return 'Target qualified leads'
    if (obj.startsWith('CPS')) return 'Target sales'
    if (obj.startsWith('CPA')) return 'Target actions'
    if (obj.startsWith('CPM')) return 'Target impressions'
    if (obj.startsWith('CPC')) return 'Target clicks'
    return 'Target volume'
  }

  const models = data.htAutoClient ? (HTAUTO_MODELS[data.htAutoClient] || []) : []

  return (
    <div>
      {/* 1 — Identity */}
      <SectionCard title="1 · Identity & Ownership" accent="#1b3a6b">
        <FieldRow label="Campaign Name" badge={<Badge type="mandatory" />}>
          <input className="ht-input" value={data.campaignName} onChange={e => onChange({ campaignName: e.target.value })} placeholder="e.g. Honda City — Q3 Lead Gen" />
        </FieldRow>
        <FieldRow label="Business Unit" badge={<Badge type="mandatory" condition="Drives conditional branch below" />}>
          <select className="ht-select" value={data.businessUnit} onChange={e => onChange({ businessUnit: e.target.value })}>
            <option value="">Select BU</option>
            {BUS.map(b => <option key={b}>{b}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Deal Type" badge={<Badge type="optional" />}>
          <select className="ht-select" value={data.dealType} onChange={e => onChange({ dealType: e.target.value })}>
            <option>Direct</option>
            <option>Agency</option>
            <option>In-house</option>
          </select>
        </FieldRow>
        {showAgencyCode && (
          <FieldRow label="Agency Code" badge={<Badge type="conditional" condition="Deal Type = Agency" />}>
            <input className="ht-input" value={data.agencyCode} onChange={e => onChange({ agencyCode: e.target.value })} placeholder="e.g. AGY-2291" style={{ fontFamily: 'var(--font-mono)' }} />
          </FieldRow>
        )}
      </SectionCard>

      {/* 2 — Objective */}
      <SectionCard title="2 · Objective & Monetization" accent="#2952a3">
        <FieldRow label="Objective / Campaign Type" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.objective} onChange={e => onChange({ objective: e.target.value })}>
            {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        {showActionType && (
          <FieldRow label="Action Type" badge={<Badge type="conditional" condition="Objective = CPA" />}>
            <select className="ht-select" value={data.actionType} onChange={e => onChange({ actionType: e.target.value })}>
              <option value="">Select action type</option>
              {['App Download', 'Transaction', 'Sign-up', 'Form Submit', 'Subscription'].map(a => <option key={a}>{a}</option>)}
            </select>
          </FieldRow>
        )}
        <FieldRow label="Goal Layer" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.goalLayer} onChange={e => onChange({ goalLayer: e.target.value })}>
            <option>Acquisition</option>
            <option>Retention</option>
          </select>
        </FieldRow>
        <FieldRow label="Attribution Method" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.attributionMethod} onChange={e => onChange({ attributionMethod: e.target.value })}>
            {['Last Click', 'First Click', 'Linear Multi-Touch', 'Time Decay', 'Position Based'].map(a => <option key={a}>{a}</option>)}
          </select>
        </FieldRow>
        <FieldRow label={objLabel()} badge={<Badge type="mandatory" />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
            <span style={{ padding: '6px 10px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: 13, color: '#334155', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>₹</span>
            <input className="ht-input" value={data.unitPrice} onChange={e => onChange({ unitPrice: e.target.value })} placeholder="145" style={{ border: 'none', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
          </div>
        </FieldRow>
        <FieldRow label={volLabel()} badge={<Badge type="mandatory" />}>
          <input className="ht-input" value={data.targetVolume} onChange={e => onChange({ targetVolume: e.target.value })} placeholder="5,500" style={{ fontFamily: 'var(--font-mono)' }} />
        </FieldRow>
        <FieldRow label="Total Campaign Budget" badge={<Badge type="mandatory" />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
            <span style={{ padding: '6px 10px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: 13, color: '#334155', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>₹</span>
            <input className="ht-input" value={data.totalBudget} onChange={e => onChange({ totalBudget: e.target.value })} placeholder="8,00,000" style={{ border: 'none', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 4 }}>Sum of channel allocations (Step 2) must not exceed this.</div>
        </FieldRow>
        <FieldRow
          label="GO vs Custom Fork"
          badge={<Badge type="optional" />}
        >
          <select className="ht-select deferred-control" disabled>
            <option>Not yet decided at program level</option>
          </select>
          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>⚠ Open decision — pending program-level alignment.</div>
        </FieldRow>
        <FieldRow label="Automatic Budget Allocation (AI-driven)" badge={<Badge type="optional" />}>
          <Toggle checked={data.autoBudgetAllocation} onChange={v => onChange({ autoBudgetAllocation: v })} />
        </FieldRow>
      </SectionCard>

      {/* 3 — Timing */}
      <SectionCard title="3 · Timing & Geography" accent="#6366f1">
        <FieldRow label="Start Date" badge={<Badge type="mandatory" />}>
          <input className="ht-input" type="date" value={data.startDate} onChange={e => onChange({ startDate: e.target.value })} />
        </FieldRow>
        <FieldRow label="End Date" badge={<Badge type="mandatory" />}>
          <input className="ht-input" type="date" value={data.endDate} onChange={e => onChange({ endDate: e.target.value })} />
        </FieldRow>
        <FieldRow label="State" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.state} onChange={e => onChange({ state: e.target.value, city: '' })}>
            {Object.keys(STATES).map(s => <option key={s}>{s}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="City" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.city} onChange={e => onChange({ city: e.target.value })}>
            <option value="">Select city</option>
            {(STATES[data.state] || []).map(c => <option key={c}>{c}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Zone" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.zone} onChange={e => onChange({ zone: e.target.value })}>
            {['North', 'South', 'East', 'West', 'Central'].map(z => <option key={z}>{z}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Pincode" badge={<Badge type="optional" />}>
          <input className="ht-input" value={data.pincode} onChange={e => onChange({ pincode: e.target.value })} placeholder="e.g. 400001" style={{ fontFamily: 'var(--font-mono)' }} />
        </FieldRow>
        {showDRR && (
          <FieldRow label="Daily Run Rate (DRR) Cap" badge={<Badge type="conditional" condition="BU = HTAuto + Obj = CPL/CPQL" />}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
              <input className="ht-input" value={data.drrCap} onChange={e => onChange({ drrCap: e.target.value })} placeholder="180" style={{ border: 'none', borderRadius: 0, fontFamily: 'var(--font-mono)' }} />
              <span style={{ padding: '6px 10px', background: '#f8fafc', borderLeft: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>leads/day</span>
            </div>
          </FieldRow>
        )}
      </SectionCard>

      {/* 4 — Tracking */}
      <SectionCard title="4 · Tracking & Export" accent="#0ea5e9">
        {[
          { label: 'UTM Source', key: 'utmSource' as const, ph: 'ht-ads' },
          { label: 'UTM Campaign', key: 'utmCampaign' as const, ph: 'honda-city-q3' },
          { label: 'UTM Medium', key: 'utmMedium' as const, ph: 'multi-channel' },
          { label: 'UTM Term', key: 'utmTerm' as const, ph: '' },
          { label: 'UTM Content', key: 'utmContent' as const, ph: '' },
        ].map(f => (
          <FieldRow key={f.label} label={f.label} badge={<Badge type="optional" />}>
            <input className="ht-input" value={data[f.key]} onChange={e => onChange({ [f.key]: e.target.value })} placeholder={f.ph} />
          </FieldRow>
        ))}
        <FieldRow label="Auto-export to Google Sheets" badge={<Badge type="conditional" condition="BU has Advanced Settings enabled" />}>
          <Toggle checked={data.autoExportSheets} onChange={v => onChange({ autoExportSheets: v })} />
        </FieldRow>
      </SectionCard>

      {/* 5 — HTAuto branch */}
      {bu === 'HTAuto' && (
        <div style={{
          border: '1.5px solid #bfdbfe', borderRadius: 8, overflow: 'hidden', marginBottom: 16,
          background: 'linear-gradient(180deg, #f0f5fb 0%, white 40px)',
        }}>
          <div style={{
            padding: '10px 16px', background: '#dbeafe', borderBottom: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#1e40af' }}>5 · HTAuto — Conditional Fields</span>
            <span style={{ fontSize: 10, color: '#1e40af', opacity: 0.7, marginLeft: 4 }}>Visible because Business Unit = HTAuto</span>
          </div>
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldRow label="Client / Advertiser" badge={<Badge type="mandatory" />}>
              <select className="ht-select" value={data.htAutoClient} onChange={e => onChange({ htAutoClient: e.target.value, selectedModels: [] })}>
                <option value="">Select client</option>
                {['Honda Cars India', 'Mahindra & Mahindra', 'Kia India'].map(c => <option key={c}>{c}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Vehicle Type" badge={<Badge type="mandatory" />}>
              <select className="ht-select" value={data.vehicleType} onChange={e => onChange({ vehicleType: e.target.value })}>
                {['Car', 'Bike', 'Three Wheeler', 'Truck', 'Bus'].map(v => <option key={v}>{v}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Model Visibility" badge={<Badge type="mandatory" />}>
              <select className="ht-select" value={data.modelVisibility} onChange={e => onChange({ modelVisibility: e.target.value })}>
                <option>Approved models only</option>
                <option>All models</option>
              </select>
            </FieldRow>
            <FieldRow label="Model" badge={<Badge type="mandatory" />}>
              {models.length > 0 ? (
                <ChipMultiSelect options={models} selected={data.selectedModels} onChange={v => onChange({ selectedModels: v })} />
              ) : (
                <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Select a client to see models</span>
              )}
            </FieldRow>
            <FieldRow label="Competitor Mapping" badge={<Badge type="optional" />}>
              <ChipMultiSelect options={COMPETITORS} selected={data.competitorMapping} onChange={v => onChange({ competitorMapping: v })} />
            </FieldRow>
            <FieldRow label="Duplicacy Check Keys" badge={<Badge type="mandatory" />}>
              <ChipMultiSelect options={DUPE_KEYS} selected={data.duplicacyKeys} onChange={v => onChange({ duplicacyKeys: v })} />
            </FieldRow>
            {/* Lead Quality Grid */}
            <div className="field-row" style={{ display: 'block', padding: '12px 0', borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="field-label">Lead Quality Verification Grid</span>
                <Badge type="mandatory" />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '6px 12px', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'left', width: 120 }}>Lead Type</th>
                      {['OTP Verified (HTDS)', 'OTP Verified (Paid)', 'WhatsApp Verified', 'Call Verified'].map(h => (
                        <th key={h} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Primary', 'Cross-Sell', 'Competitor'].map(row => (
                      <tr key={row}>
                        <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0', fontSize: 12.5, fontWeight: 600, color: '#334155' }}>{row}</td>
                        {[`OTP-HTDS`, `OTP-Paid`, `WA`, `Call`].map(col => {
                          const gridKey = `${row}_${col}`
                          return (
                            <td key={col} style={{ padding: '7px 12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={!!data.leadQualityGrid[gridKey]}
                                onChange={e => onChange({ leadQualityGrid: { ...data.leadQualityGrid, [gridKey]: e.target.checked } })}
                                style={{ width: 14, height: 14, accentColor: '#1b3a6b', cursor: 'pointer' }}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <FieldRow label="Sampling Enabled" badge={<Badge type="optional" />}>
              <Toggle checked={data.samplingEnabled} onChange={v => onChange({ samplingEnabled: v })} />
            </FieldRow>
          </div>
        </div>
      )}

      {/* 6 — Affiliates branch */}
      {bu === 'Affiliates' && (
        <div style={{ border: '1.5px solid #d1fae5', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', background: '#d1fae5', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#065f46' }}>6 · Affiliates — Conditional Fields</span>
          </div>
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldRow label="Marketplace" badge={<Badge type="mandatory" />}>
              <select className="ht-select" value={data.marketplace} onChange={e => onChange({ marketplace: e.target.value })}>
                {['Myntra', 'Amazon', 'Flipkart', 'Nykaa'].map(m => <option key={m}>{m}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Product / Model" badge={<Badge type="mandatory" />}>
              <input className="ht-input" value={data.productModel} onChange={e => onChange({ productModel: e.target.value })} placeholder="e.g. Myntra Fashion Sale — SKU MY-4471" />
            </FieldRow>
          </div>
        </div>
      )}

      {/* 7 — Education branch */}
      {bu === 'Education' && (
        <div style={{ border: '1.5px solid #fde68a', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', background: '#fef3c7', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#92400e' }}>7 · Education — Conditional Fields</span>
          </div>
          <div style={{ padding: '4px 16px 12px' }}>
            <FieldRow label="Campaign Type" badge={<Badge type="mandatory" />}>
              <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                {['CPL', 'CPM'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="eduCampaignType" value={t} checked={data.eduCampaignType === t} onChange={() => onChange({ eduCampaignType: t })} style={{ accentColor: '#1b3a6b' }} />
                    <span style={{ fontWeight: 500, color: '#334155' }}>{t}</span>
                  </label>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Product Name" badge={<Badge type="mandatory" />}>
              <input className="ht-input" value={data.eduProductName} onChange={e => onChange({ eduProductName: e.target.value })} placeholder="e.g. NIIT — PG Diploma in Data Science" />
            </FieldRow>
            <FieldRow label="Product ID" badge={<Badge type="mandatory" />}>
              <input className="ht-input" value={data.eduProductId} onChange={e => onChange({ eduProductId: e.target.value })} placeholder="EDU-NIIT-PGDDS-04" style={{ fontFamily: 'var(--font-mono)' }} />
            </FieldRow>
            <FieldRow label="Brand" badge={<Badge type="mandatory" />}>
              <input className="ht-input" value={data.eduBrand} onChange={e => onChange({ eduBrand: e.target.value })} placeholder="e.g. NIIT" />
            </FieldRow>
            {/* Custom key-value pairs */}
            <div style={{ paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="field-label">Additional Fields</span>
                <Badge type="optional" />
              </div>
              {data.eduCustomFields.map((cf, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                  <input className="ht-input" value={cf.key} onChange={e => { const f = [...data.eduCustomFields]; f[i] = { ...f[i], key: e.target.value }; onChange({ eduCustomFields: f }) }} placeholder="Field name" style={{ width: '40%' }} />
                  <input className="ht-input" value={cf.value} onChange={e => { const f = [...data.eduCustomFields]; f[i] = { ...f[i], value: e.target.value }; onChange({ eduCustomFields: f }) }} placeholder="Value" style={{ flex: 1 }} />
                  <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: 12, color: '#dc2626' }} onClick={() => onChange({ eduCustomFields: data.eduCustomFields.filter((_, j) => j !== i) })}>✕</button>
                </div>
              ))}
              <button className="btn-secondary" style={{ fontSize: 12, marginTop: 4 }} onClick={() => onChange({ eduCustomFields: [...data.eduCustomFields, { key: '', value: '' }] })}>
                + Add field
              </button>
            </div>
            <FieldRow label="Call Verified" badge={<Badge type="mandatory" />}>
              <Toggle checked={data.eduCallVerified} onChange={v => onChange({ eduCallVerified: v })} />
            </FieldRow>
            <FieldRow label="OTP Verified" badge={<Badge type="mandatory" />}>
              <Toggle checked={data.eduOtpVerified} onChange={v => onChange({ eduOtpVerified: v })} />
            </FieldRow>
          </div>
        </div>
      )}

      {/* 8 — Other BUs placeholder */}
      {['HTShopNow', 'HT', 'LM', 'LH', 'HTTech'].includes(bu) && (
        <div style={{ border: '1.5px dashed #e2e8f0', borderRadius: 8, padding: '20px 20px', marginBottom: 16, background: '#f8fafc', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>Fields for <strong>{bu}</strong> are pending design discovery</div>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>This section will be populated after the BU discovery session with the product team.</div>
        </div>
      )}
    </div>
  )
}
