import { useEffect, useState } from 'react'
import Badge from '../../components/Badge'
import Toggle from '../../components/Toggle'
import { api } from '../../api'
import type { CampaignFormData, Channel } from '../../types'

interface Props {
  data: CampaignFormData
  onChange: (patch: Partial<CampaignFormData>) => void
}

const CH_COLORS: Record<Channel, string> = {
  Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6',
}

const WA_CHANNELS_FALLBACK: { id: string; label: string; number: string }[] = [
  { id: 'wa_htauto_primary', label: 'HTAuto — Primary', number: '9876543210' },
  { id: 'wa_htauto_secondary', label: 'HTAuto — Secondary', number: '9876543211' },
  { id: 'wa_httech', label: 'HTTech', number: '9876543212' },
  { id: 'wa_htshopnow', label: 'HTShopNow', number: '9876543213' },
  { id: 'wa_affiliates', label: 'Affiliates', number: '9876543214' },
  { id: 'wa_education', label: 'Education', number: '9876543215' },
  { id: 'wa_ht_corporate', label: 'HT — Corporate', number: '9876543216' },
  { id: 'wa_lm_business', label: 'LM — Business', number: '9876543217' },
  { id: 'wa_lh_hindi', label: 'LH — Hindi', number: '9876543218' },
  { id: 'wa_promotions', label: 'Promotions & Offers', number: '9876543219' },
]

const WA_TEMPLATES: Record<string, { body: string; vars: string[] }> = {
  lead_confirmation_v2: {
    body: 'Hi {{1}}, thanks for your interest in {{2}}. Our team will contact you within {{3}} hours.',
    vars: ['Customer name', 'Model name', 'Response hours'],
  },
  otp_verification: {
    body: 'Your OTP for verifying interest in {{1}} is {{2}}. Valid for 10 minutes.',
    vars: ['Model name', 'OTP code'],
  },
  offer_blast_diwali: {
    body: 'Hi {{1}}, exclusive Diwali offer on {{2}} — get up to {{3}}% off. Visit your nearest dealer today.',
    vars: ['Customer name', 'Model name', 'Discount %'],
  },
}

function FieldRow({ label, badge, children, helper }: { label: string | React.ReactNode; badge: React.ReactNode; children: React.ReactNode; helper?: string }) {
  return (
    <div className="field-row" style={{ alignItems: 'start', paddingBottom: helper ? 10 : undefined }}>
      <div className="field-label">{label} {badge}</div>
      <div>
        {children}
        {helper && <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>{helper}</div>}
      </div>
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

function CohortField({ data, value, onChange, options }: { data: CampaignFormData; value: string; onChange: (v: string) => void; options: string[] }) {
  const inherited = data.defaultCohortAudience
  return (
    <FieldRow label="Cohort / Audience" badge={<Badge type="optional" />}
      helper={value === ''
        ? (inherited ? `Inheriting campaign default (set in Step 1): ${inherited}` : 'No campaign default is set in Step 1 — pick one below to target this channel specifically.')
        : 'Overriding the campaign default for this channel only.'}>
      <select className="ht-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{inherited ? `Use campaign default (${inherited})` : 'None — no audience restriction'}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </FieldRow>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '8px 0 4px', padding: '10px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function DayTimePicker({ days, selectedDays, timeStart, timeEnd, onDaysChange, onTimeStartChange, onTimeEndChange }: {
  days: string[]
  selectedDays: string[]
  timeStart: string
  timeEnd: string
  onDaysChange: (v: string[]) => void
  onTimeStartChange: (v: string) => void
  onTimeEndChange: (v: string) => void
}) {
  const toggle = (d: string) => onDaysChange(selectedDays.includes(d) ? selectedDays.filter(x => x !== d) : [...selectedDays, d])
  return (
    <SubSection title="Day &amp; Time Windows">
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5 }}>Active days</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map(d => (
            <button
              key={d}
              onClick={() => toggle(d)}
              style={{
                width: 36, height: 28, borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${selectedDays.includes(d) ? '#1b3a6b' : '#e2e8f0'}`,
                background: selectedDays.includes(d) ? '#1b3a6b' : 'white',
                color: selectedDays.includes(d) ? 'white' : '#64748b',
                transition: 'all 0.12s',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>From</label>
          <input type="time" className="ht-input" value={timeStart} onChange={e => onTimeStartChange(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Until</label>
          <input type="time" className="ht-input" value={timeEnd} onChange={e => onTimeEndChange(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        </div>
      </div>
    </SubSection>
  )
}

// ─── Echo ───────────────────────────────────────────────────────────────────
function EchoTab({ data, onChange }: Props) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const isHTAuto = data.businessUnit === 'HTAuto'

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
          <span className="section-card-title">Echo — On-site Channel Configuration</span>
        </div>
        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, background: '#eef2ff', padding: '2px 8px', borderRadius: 4 }}>HT On-site</span>
      </div>
      <div className="section-card-body">

        {/* Placement */}
        <FieldRow label="Objective" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoObjective} onChange={e => onChange({ echoObjective: e.target.value })}>
            {['User engagement', 'New feature promotion', 'Paid Advertisement', 'App download', 'Voucher Advertisement', 'Personalization', 'Personal Finance', 'Test', 'Fallback/Default'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Property" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoProperty} onChange={e => onChange({ echoProperty: e.target.value })}>
            {['HTAuto Web', 'HT Web', 'LM Web', 'LH Web', 'HT App'].map(p => <option key={p}>{p}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Platform" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoPlatform} onChange={e => onChange({ echoPlatform: e.target.value })}>
            {['WEB', 'MWEB', 'AMP', 'AOS', 'iOS'].map(p => <option key={p}>{p}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Position / Placement" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoPosition} onChange={e => onChange({ echoPosition: e.target.value })}>
            {['Top Banner', 'MOA', 'Bottom Popup', 'Nav Bar L2', 'Interstitial'].map(p => <option key={p}>{p}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Inventory Type" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoInventoryType} onChange={e => onChange({ echoInventoryType: e.target.value })}>
            <option>Standalone</option>
            <option>Carousel</option>
          </select>
        </FieldRow>
        <FieldRow label="Pages" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoPages} onChange={e => onChange({ echoPages: e.target.value })}>
            <option>All pages</option>
            <option>Specific pages</option>
          </select>
          {data.echoPages === 'Specific pages' && (
            <div style={{ marginTop: 8 }}>
              <textarea
                className="ht-input" rows={2}
                value={data.echoSpecificPages.join('\n')}
                onChange={e => onChange({ echoSpecificPages: e.target.value.split('\n') })}
                placeholder="One page URL or path per line, e.g. /honda-city"
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
            </div>
          )}
        </FieldRow>
        <FieldRow label="User State" badge={<Badge type="mandatory" />} helper="Users that are...">
          <select className="ht-select" value={data.echoUserState} onChange={e => onChange({ echoUserState: e.target.value })}>
            <option>Non-Loggedin</option>
            <option>Logged in and not subscribed</option>
            <option>Logged in and subscribed</option>
          </select>
        </FieldRow>
        <FieldRow label="User Source" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoUserSource} onChange={e => onChange({ echoUserSource: e.target.value })}>
            {['All Sources', 'Organic', 'Direct', 'Paid Search', 'Paid Social', 'Referral', 'Email'].map(s => <option key={s}>{s}</option>)}
          </select>
        </FieldRow>
        <CohortField data={data} value={data.echoCohort} onChange={v => onChange({ echoCohort: v })}
          options={['HTAuto_HighIntent_Apr26', 'Realtime: Cart Abandoners', 'Education_Web_Leads_Q2']} />
        <FieldRow label="Creative / Content Type" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.echoCreativeType} onChange={e => onChange({ echoCreativeType: e.target.value })}>
            {['Choose from templates', 'Upload image', 'Custom HTML', 'SDK intervention'].map(t => <option key={t}>{t}</option>)}
          </select>
        </FieldRow>

        {/* Schedule */}
        <FieldRow label="Schedule (day/time windows)" badge={<Badge type="optional" />}>
          <Toggle checked={data.echoScheduleEnabled} onChange={v => onChange({ echoScheduleEnabled: v })} />
          {data.echoScheduleEnabled && (
            <DayTimePicker
              days={DAYS}
              selectedDays={data.echoDaySchedule}
              timeStart={data.echoTimeStart}
              timeEnd={data.echoTimeEnd}
              onDaysChange={v => onChange({ echoDaySchedule: v })}
              onTimeStartChange={v => onChange({ echoTimeStart: v })}
              onTimeEndChange={v => onChange({ echoTimeEnd: v })}
            />
          )}
        </FieldRow>

        {/* Frequency capping */}
        <FieldRow label="Frequency Capping" badge={<Badge type="optional" />}>
          <Toggle checked={data.echoFreqCapEnabled} onChange={v => onChange({ echoFreqCapEnabled: v })} />
          {data.echoFreqCapEnabled && (
            <SubSection title="Cap limits">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { key: 'echoFreqSession' as const, label: 'Session cap', val: data.echoFreqSession },
                  { key: 'echoFreqDaily' as const, label: 'Daily cap', val: data.echoFreqDaily },
                  { key: 'echoFreqWeekly' as const, label: 'Weekly cap', val: data.echoFreqWeekly },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>{f.label}</label>
                    <input
                      className="ht-input"
                      value={f.val}
                      onChange={e => onChange({ [f.key]: e.target.value })}
                      placeholder="—"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                    />
                  </div>
                ))}
              </div>
            </SubSection>
          )}
        </FieldRow>

        {/* A/B Experiment */}
        <FieldRow label="Experiment (A/B)" badge={<Badge type="optional" />}>
          <Toggle checked={data.echoExperimentEnabled} onChange={v => onChange({ echoExperimentEnabled: v })} />
          {data.echoExperimentEnabled && (
            <SubSection title="Experiment config">
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>
                  Traffic split — Variant A: <strong style={{ color: '#1b3a6b' }}>{data.echoAbSplit}%</strong> | Variant B: <strong style={{ color: '#1b3a6b' }}>{100 - parseInt(data.echoAbSplit || '50', 10)}%</strong>
                </label>
                <input
                  type="range" min={10} max={90} step={5}
                  value={data.echoAbSplit}
                  onChange={e => onChange({ echoAbSplit: e.target.value })}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Variant A label</label>
                  <input className="ht-input" value={data.echoAbVariantA} onChange={e => onChange({ echoAbVariantA: e.target.value })} style={{ fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Variant B label</label>
                  <input className="ht-input" value={data.echoAbVariantB} onChange={e => onChange({ echoAbVariantB: e.target.value })} style={{ fontSize: 12 }} />
                </div>
              </div>
            </SubSection>
          )}
        </FieldRow>

        {/* Form fields */}
        <FieldRow
          label="Form Fields"
          badge={<Badge type="conditional" condition="If channel captures a lead" />}
          helper="Name, Phone, and City are recommended defaults."
        >
          <ChipMultiSelect
            options={['Name', 'Phone', 'City', 'Email', 'Pincode', 'Dealer', 'Buying Time']}
            selected={data.echoFormFields}
            onChange={v => onChange({ echoFormFields: v })}
          />
        </FieldRow>

        {/* HTAuto-specific: model placement tie-in */}
        {isHTAuto && (
          <FieldRow label="Model-Level Placement" badge={<Badge type="conditional" condition="HTAuto BU only" />}
            helper="Placement will resolve to model-specific pages for each selected model.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '4px 0' }}>
              {data.selectedModels.length > 0 ? data.selectedModels.map(m => (
                <span key={m} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: '1px solid #6366f120', background: '#6366f108', color: '#4f46e5',
                }}>{m}</span>
              )) : (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>No models selected — go back to Step 1 to select models.</span>
              )}
            </div>
          </FieldRow>
        )}

        {/* Additional settings */}
        <FieldRow label="Additional settings" badge={<Badge type="optional" />}>
          <Toggle checked={data.echoAdditionalSettingsEnabled} onChange={v => onChange({ echoAdditionalSettingsEnabled: v })} />
          {data.echoAdditionalSettingsEnabled && (
            <SubSection title="Priority & country">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Priority</label>
                  <input className="ht-input" value={data.echoPriority} onChange={e => onChange({ echoPriority: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Country</label>
                  <select className="ht-select" value={data.echoCountry} onChange={e => onChange({ echoCountry: e.target.value })}>
                    <option>All</option>
                    <option>India</option>
                    <option>India + NRI markets</option>
                  </select>
                </div>
              </div>
            </SubSection>
          )}
        </FieldRow>

        {/* UTM */}
        <FieldRow label="UTM Source (channel)" badge={<Badge type="optional" />}>
          <input className="ht-input" value={data.echoUtmSource} onChange={e => onChange({ echoUtmSource: e.target.value })} placeholder="echo-onsite" />
        </FieldRow>
        <FieldRow label="UTM Medium (channel)" badge={<Badge type="optional" />}>
          <input className="ht-input" value={data.echoUtmMedium} onChange={e => onChange({ echoUtmMedium: e.target.value })} placeholder="banner" />
        </FieldRow>
      </div>
    </div>
  )
}

const STATES_ALL = ['Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh']

// ─── DSP ────────────────────────────────────────────────────────────────────
function DSPTab({ data, onChange }: Props) {

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
          <span className="section-card-title">DSP — Programmatic Display &amp; Video Configuration</span>
        </div>
        <span style={{ fontSize: 11, color: '#0369a1', fontWeight: 600, background: '#e0f2fe', padding: '2px 8px', borderRadius: 4 }}>HT DSP</span>
      </div>
      <div className="section-card-body">

        <FieldRow label="Audience Type" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.dspAudienceType} onChange={e => onChange({ dspAudienceType: e.target.value })}>
            {['Retargeting', 'Prospecting', 'Customizable', 'Broad Targeting'].map(t => <option key={t}>{t}</option>)}
          </select>
        </FieldRow>
        <CohortField data={data} value={data.dspCohort} onChange={v => onChange({ dspCohort: v })}
          options={['HTAuto_HighIntent_Apr26', 'Lookalike: Recent Purchasers', 'Realtime: Cart Abandoners']} />
        <FieldRow label="Media Type" badge={<Badge type="mandatory" />}>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Display', 'Video'].map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="dspMediaType" value={t} checked={data.dspMediaType === t} onChange={() => onChange({ dspMediaType: t })} style={{ accentColor: '#0ea5e9' }} />
                <span style={{ fontWeight: 500, color: '#334155' }}>{t}</span>
              </label>
            ))}
          </div>
        </FieldRow>

        {/* Bidding */}
        <FieldRow label="Bidding Type" badge={<Badge type="mandatory" />}>
          <div style={{ display: 'flex', gap: 10 }}>
            {['CPM', 'CPC'].map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="dspBidding" value={t} checked={data.dspBiddingType === t} onChange={() => onChange({ dspBiddingType: t })} style={{ accentColor: '#0ea5e9' }} />
                <span style={{ fontWeight: 500, color: '#334155' }}>{t}</span>
              </label>
            ))}
          </div>
        </FieldRow>
        <FieldRow
          label={`Bid Cap (₹ per ${data.dspBiddingType === 'CPM' ? '1,000 impressions' : 'click'})`}
          badge={<Badge type="mandatory" />}
        >
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
            <span style={{ padding: '6px 10px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'var(--font-mono)', color: '#334155' }}>₹</span>
            <input
              className="ht-input"
              value={data.dspBidCap}
              onChange={e => onChange({ dspBidCap: e.target.value })}
              placeholder="0"
              style={{ border: 'none', borderRadius: 0, fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </FieldRow>

        <FieldRow label="Optimization Goal" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.dspOptimizationGoal} onChange={e => onChange({ dspOptimizationGoal: e.target.value })}>
            {['Video Views', 'New Visitor', 'Sales / Revenue', 'Brand Awareness', 'Lead Generation'].map(g => <option key={g}>{g}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Attribution Method" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.dspAttributionMethod} onChange={e => onChange({ dspAttributionMethod: e.target.value })}>
            {['Criteo Attribution', 'GA Attribution', 'Last Click', 'Post Click', 'Linear'].map(a => <option key={a}>{a}</option>)}
          </select>
        </FieldRow>

        {/* Brand safety */}
        <FieldRow label="Brand Safety" badge={<Badge type="optional" />}>
          <select className="ht-select" value={data.dspBrandSafety} onChange={e => onChange({ dspBrandSafety: e.target.value })}>
            {['Standard', 'Contextual', 'Strict — Whitelist only'].map(b => <option key={b}>{b}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Viewability Threshold" badge={<Badge type="optional" />}>
          <select className="ht-select" value={data.dspViewability} onChange={e => onChange({ dspViewability: e.target.value })}>
            {['No minimum', '50%', '70%', '100% (fully in-view)'].map(v => <option key={v}>{v}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Frequency Capping" badge={<Badge type="optional" />}
          helper="e.g. 3 impressions / user / day">
          <input className="ht-input" value={data.dspFreqCap} onChange={e => onChange({ dspFreqCap: e.target.value })} placeholder="3 impressions / user / day" />
        </FieldRow>

        {/* Geo override */}
        <FieldRow label="Geo Targeting Override" badge={<Badge type="optional" />}>
          <Toggle checked={data.dspGeoOverride} onChange={v => onChange({ dspGeoOverride: v })} />
          {data.dspGeoOverride && (
            <SubSection title="DSP geo targeting">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 5 }}>Include geo</div>
                  <ChipMultiSelect options={STATES_ALL} selected={data.dspGeoInclude} onChange={v => onChange({ dspGeoInclude: v })} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginBottom: 5 }}>Exclude geo</div>
                  <ChipMultiSelect options={STATES_ALL} selected={data.dspGeoExclude} onChange={v => onChange({ dspGeoExclude: v })} />
                </div>
              </div>
            </SubSection>
          )}
        </FieldRow>

        {/* Creative upload */}
        <FieldRow label="Creative Upload" badge={<Badge type="mandatory" />}>
          <div style={{
            border: '2px dashed #bae6fd', borderRadius: 6, padding: '18px 16px',
            textAlign: 'center', cursor: 'pointer', background: '#f0f9ff',
            transition: 'border-color 0.15s',
          }}>
            <div style={{ fontSize: 22, marginBottom: 4, color: '#0ea5e9' }}>⬆</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: '#0369a1' }}>Drop creative files here or click to upload</div>
            <div style={{ fontSize: 11, color: '#7dd3fc', marginTop: 3 }}>JPG, PNG, GIF, MP4 · Max 10 MB per file · Multiple sizes accepted</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {['320×50', '300×250', '728×90', '970×90', '1280×720'].map(s => (
                <span key={s} style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 3 }}>{s}</span>
              ))}
            </div>
          </div>
        </FieldRow>
      </div>
    </div>
  )
}

// ─── WhatsApp ───────────────────────────────────────────────────────────────
function WhatsAppTab({ data, onChange }: Props) {
  const tpl = WA_TEMPLATES[data.waTemplateId]
  const varValues = [data.waVar1, data.waVar2, data.waVar3]
  const [testNumber, setTestNumber] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [channels, setChannels] = useState<{ id: string; label: string; phone_number: string }[]>(
    WA_CHANNELS_FALLBACK.map(c => ({ id: c.id, label: c.label, phone_number: c.number }))
  )

  useEffect(() => {
    let cancelled = false
    api.whatsappChannels()
      .then(res => { if (!cancelled && res.channels?.length) setChannels(res.channels) })
      .catch(() => { /* keep fallback list if the registry call fails */ })
    return () => { cancelled = true }
  }, [])

  const sendTest = async () => {
    const digits = testNumber.replace(/\D/g, '')
    if (digits.length < 10) { setTestStatus('error'); setTestMessage('Enter a valid 10-digit phone number'); return }
    setTestStatus('sending')
    try {
      const result = await api.testSendWhatsapp({ channelId: data.waChannelId, phone: digits, templateId: data.waTemplateId, vars: varValues })
      setTestStatus(result.status === 'failed' ? 'error' : 'sent')
      setTestMessage(result.message)
    } catch (err) {
      setTestStatus('error')
      setTestMessage(err instanceof Error ? err.message : 'Could not reach the server')
    }
    setTimeout(() => setTestStatus('idle'), 4000)
  }

  const previewBody = tpl ? tpl.vars.reduce((body, _v, i) => {
    const val = varValues[i] || `{{${i + 1}}}`
    return body.replace(`{{${i + 1}}}`, val)
  }, tpl.body) : ''

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span className="section-card-title">WhatsApp — Outbound Messaging Configuration</span>
        </div>
        <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>WhatsApp Business API</span>
      </div>
      <div className="section-card-body">

        <FieldRow label="WhatsApp Channel" badge={<Badge type="mandatory" />}
          helper="The sending number recipients will see this message come from.">
          <select className="ht-select" value={data.waChannelId} onChange={e => onChange({ waChannelId: e.target.value })}>
            {channels.map(c => (
              <option key={c.id} value={c.id}>{c.label} — {c.phone_number}</option>
            ))}
          </select>
        </FieldRow>

        <CohortField data={data} value={data.waCohort} onChange={v => onChange({ waCohort: v })}
          options={['HTAuto_HighIntent_Apr26', 'Realtime: Form Abandoners']} />
        <FieldRow label="Template ID" badge={<Badge type="mandatory" />}
          helper="Only pre-approved WhatsApp Business templates may be used.">
          <select className="ht-select" value={data.waTemplateId} onChange={e => onChange({ waTemplateId: e.target.value })}>
            {Object.keys(WA_TEMPLATES).map(t => <option key={t}>{t}</option>)}
          </select>
        </FieldRow>

        {/* Template preview + variable inputs */}
        {tpl && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Template variables</div>
              {tpl.vars.map((varName, i) => {
                const keys: ('waVar1' | 'waVar2' | 'waVar3')[] = ['waVar1', 'waVar2', 'waVar3']
                return (
                  <div key={varName} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: 3, marginRight: 5 }}>{`{{${i + 1}}}`}</span>
                      {varName}
                    </label>
                    <input className="ht-input" value={varValues[i]} onChange={e => onChange({ [keys[i]]: e.target.value })} placeholder={varName} />
                  </div>
                )
              })}
            </div>

            {/* Phone mockup */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Message preview</div>
              <div style={{
                width: 260, background: '#0a0f1a', borderRadius: 34, padding: '20px 12px',
                boxShadow: '0 16px 44px rgba(0,0,0,0.38)', border: '6px solid #1a1f2b',
              }}>
                <div style={{
                  background: 'linear-gradient(180deg,#0b7a67,#075e54)', borderRadius: '14px 14px 0 0',
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'white', fontWeight: 700 }}>H</div>
                  <div>
                    <div style={{ color: 'white', fontSize: 13.5, fontWeight: 700 }}>HT Ads</div>
                    <div style={{ color: '#c8f7dc', fontSize: 10.5 }}>✓ Verified Business</div>
                  </div>
                </div>
                <div style={{
                  background: '#0b141a', minHeight: 190, padding: '14px 10px', display: 'flex',
                  flexDirection: 'column', gap: 8, justifyContent: 'flex-end',
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                  backgroundSize: '14px 14px',
                }}>
                  <div style={{ background: '#1f2c34', borderRadius: '2px 12px 12px 12px', padding: '10px 12px', maxWidth: '92%', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    <p style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.55, margin: 0 }}>{previewBody}</p>
                    <span style={{ fontSize: 10, color: '#8696a0', display: 'block', textAlign: 'right', marginTop: 6 }}>10:32 AM ✓✓</span>
                  </div>
                </div>
                <div style={{ background: '#0b141a', borderRadius: '0 0 14px 14px', padding: '10px 10px', display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, height: 30, background: '#1f2c34', borderRadius: 15 }} />
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white' }}>➤</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <FieldRow label="Value Entry Method" badge={<Badge type="mandatory" />}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ v: 'manual', l: 'Enter values manually' }, { v: 'upload', l: 'Upload file with values per user' }].map(opt => (
              <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="waMethod" value={opt.v} checked={data.waValueMethod === opt.v} onChange={() => onChange({ waValueMethod: opt.v })} style={{ accentColor: '#22c55e' }} />
                <span style={{ fontWeight: 500, color: '#334155' }}>{opt.l}</span>
              </label>
            ))}
          </div>
        </FieldRow>

        {data.waValueMethod === 'manual' && (
          <>
            <FieldRow label="Recipient Phone Numbers" badge={<Badge type="mandatory" condition="Manual mode + no cohort" />}
              helper="One number per line. Include country code (+91...).">
              <textarea
                className="ht-input" rows={3}
                defaultValue="+91 98200 11234"
                placeholder="One phone number per line"
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
            </FieldRow>

            <FieldRow label="Test This Message" badge={<Badge type="optional" />}
              helper="Sends the message above to one number right now, using the live values entered.">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="ht-input"
                  value={testNumber}
                  onChange={e => setTestNumber(e.target.value)}
                  placeholder="Your phone number, e.g. 9876543210"
                  style={{ fontFamily: 'var(--font-mono)', maxWidth: 220 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={sendTest}
                  disabled={testStatus === 'sending'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {testStatus === 'sending' ? 'Sending…' : '📲 Test the message'}
                </button>
                {testStatus === 'sent' && <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>✓ {testMessage || 'Sent'}</span>}
                {testStatus === 'error' && <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{testMessage || "Couldn't send — check the number"}</span>}
              </div>
            </FieldRow>
          </>
        )}

        {data.waValueMethod === 'upload' && (
          <FieldRow label="Cohort / User File" badge={<Badge type="conditional" condition="Upload mode" />}>
            <div style={{ border: '2px dashed #bbf7d0', borderRadius: 6, padding: '14px', background: '#f0fdf4', cursor: 'pointer' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#15803d', marginBottom: 4 }}>Upload CSV / XLSX</div>
              <div style={{ fontSize: 10.5, color: '#4ade80' }}>
                Required columns: phone_number, var1, var2{tpl && tpl.vars.length > 2 ? ', var3' : ''}
              </div>
            </div>
          </FieldRow>
        )}

        {/* Send window */}
        <FieldRow label="Send Window" badge={<Badge type="optional" />}
          helper="Messages will only be dispatched in this time window.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>From</label>
              <input type="time" className="ht-input" value={data.waTimeStart} onChange={e => onChange({ waTimeStart: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Until</label>
              <input type="time" className="ht-input" value={data.waTimeEnd} onChange={e => onChange({ waTimeEnd: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
          </div>
        </FieldRow>

        <FieldRow label="Daily Rate Limit" badge={<Badge type="optional" />}
          helper="Maximum messages to dispatch per day across this campaign.">
          <input className="ht-input" value={data.waDailyLimit} onChange={e => onChange({ waDailyLimit: e.target.value })} placeholder="5000" style={{ fontFamily: 'var(--font-mono)' }} />
        </FieldRow>

        {data.objective === 'CPA – Cost per Action' && (
          <FieldRow label="Inbound Postback / Webhook" badge={<Badge type="conditional" condition="Objective = CPA + WhatsApp is acquisition point" />}
            helper="Receives conversion signals for attribution.">
            <input className="ht-input" placeholder="https://webhook.ht-ads.com/inbound/..." />
          </FieldRow>
        )}
      </div>
    </div>
  )
}

// ─── Voice AI ────────────────────────────────────────────────────────────────
function VoiceAITab({ data, onChange }: Props) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          <span className="section-card-title">Voice AI — IVR / Outbound Call Configuration</span>
        </div>
        <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600, background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>Voice AI Platform</span>
      </div>
      <div className="section-card-body">

        <CohortField data={data} value={data.voiceCohort} onChange={v => onChange({ voiceCohort: v })}
          options={['HTAuto_HighIntent_Apr26', 'Realtime: Form Abandoners']} />
        <FieldRow label="Voice Bot / IVR Script ID" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.voiceScriptId} onChange={e => onChange({ voiceScriptId: e.target.value })}>
            <option value="ivr_lead_verify_v1">ivr_lead_verify_v1 — Lead verification flow</option>
            <option value="ivr_loan_qualify_v2">ivr_loan_qualify_v2 — Loan qualification flow</option>
            <option value="ivr_offer_blast_v1">ivr_offer_blast_v1 — Promotional outbound blast</option>
          </select>
        </FieldRow>
        <FieldRow label="Recipient / Cohort Upload" badge={<Badge type="mandatory" condition="No cohort selected" />}>
          <div style={{ border: '2px dashed #fde68a', borderRadius: 6, padding: '14px', background: '#fffbeb', cursor: 'pointer' }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: '#92400e', marginBottom: 4 }}>Upload CSV / XLSX</div>
            <div style={{ fontSize: 10.5, color: '#d97706' }}>Required columns: phone_number, model_name, username</div>
          </div>
        </FieldRow>

        {/* Calling hours */}
        <FieldRow label="Calling Hours" badge={<Badge type="mandatory" />}
          helper="Calls will only be initiated within this window. TRAI regulations apply.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Start time</label>
              <input type="time" className="ht-input" value={data.voiceCallStart} onChange={e => onChange({ voiceCallStart: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>End time</label>
              <input type="time" className="ht-input" value={data.voiceCallEnd} onChange={e => onChange({ voiceCallEnd: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
          </div>
        </FieldRow>

        {/* Retry logic */}
        <FieldRow label="Retry Logic" badge={<Badge type="optional" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Max retries</label>
              <input className="ht-input" value={data.voiceMaxRetries} onChange={e => onChange({ voiceMaxRetries: e.target.value })} placeholder="2" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Retry delay (minutes)</label>
              <input className="ht-input" value={data.voiceRetryDelay} onChange={e => onChange({ voiceRetryDelay: e.target.value })} placeholder="120" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>
        </FieldRow>

        {/* DTMF mapping */}
        <FieldRow label="DTMF Key → Outcome Mapping" badge={<Badge type="mandatory" />}>
          <SubSection title="Keypress disposition rules">
            {[
              { key: '1', field: 'voiceDtmf1' as const, val: data.voiceDtmf1, label: 'Key 1' },
              { key: '2', field: 'voiceDtmf2' as const, val: data.voiceDtmf2, label: 'Key 2' },
              { key: '9', field: 'voiceDtmf9' as const, val: data.voiceDtmf9, label: 'Key 9' },
            ].map(row => (
              <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: '#f59e0b',
                  color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{row.key}</div>
                <input
                  className="ht-input"
                  value={row.val}
                  onChange={e => onChange({ [row.field]: e.target.value })}
                  placeholder={`Outcome for key ${row.key}`}
                  style={{ fontSize: 12 }}
                />
              </div>
            ))}
          </SubSection>
        </FieldRow>

        <FieldRow label="Verification Outcome Mapping" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.voiceOutcomeMapping} onChange={e => onChange({ voiceOutcomeMapping: e.target.value })}>
            <option>Feeds into Lead Quality Matrix → Call Verified</option>
            <option>Standalone — no matrix integration</option>
            <option>Feeds into Lead Quality Matrix → Call Unverified</option>
          </select>
        </FieldRow>

        {/* Lead disposition codes */}
        <FieldRow label="Lead Disposition Codes" badge={<Badge type="optional" />}
          helper="Codes available as call outcome labels in reporting.">
          <ChipMultiSelect
            options={['Interested', 'Call Back', 'Not Interested', 'Wrong Number', 'Do Not Call', 'Transferred', 'Voicemail']}
            selected={data.voiceLeadDispositions}
            onChange={v => onChange({ voiceLeadDispositions: v })}
          />
        </FieldRow>
      </div>
    </div>
  )
}

// ─── Meta ────────────────────────────────────────────────────────────────────
const META_OBJECTIVES: Record<string, { conversionLocations: string[]; optimizationGoals: string[] }> = {
  'Awareness': { conversionLocations: ['On-platform (no destination required)'], optimizationGoals: ['Reach', 'Impressions', 'Ad Recall Lift', 'ThruPlay (video)'] },
  'Traffic': { conversionLocations: ['Website', 'App', 'Messenger', 'WhatsApp', 'Calls'], optimizationGoals: ['Link Clicks', 'Landing Page Views', 'Impressions', 'Daily Unique Reach'] },
  'Engagement': { conversionLocations: ['On Facebook / Instagram', 'Messenger', 'Calls'], optimizationGoals: ['Post Engagement', 'ThruPlay (video)', 'Messaging Conversations Started', 'Calls'] },
  'Leads': { conversionLocations: ['Instant Forms', 'Website', 'Website & Instant Forms (Hybrid)', 'Calls', 'App', 'Messenger'], optimizationGoals: ['Leads', 'Conversion Leads (qualified)'] },
  'App Promotion': { conversionLocations: ['App'], optimizationGoals: ['App Installs', 'App Events', 'Value Optimization'] },
  'Sales': { conversionLocations: ['Website', 'App', 'Website & App', 'Shop', 'Messenger'], optimizationGoals: ['Conversions', 'Conversion Value / ROAS', 'Landing Page Views'] },
}

const META_CTA_OPTIONS = ['Learn More', 'Shop Now', 'Sign Up', 'Download', 'Book Now', 'Call Now', 'Send Message', 'Get Offer', 'Subscribe']
const META_PLACEMENT_OPTIONS = ['Facebook Feed', 'Instagram Feed', 'Reels', 'Stories', 'Marketplace', 'Audience Network', 'Messenger']
const META_DETAILED_TARGETING_OPTIONS = ['In-market: Automotive', 'In-market: Real Estate', 'In-market: Education', 'Frequent Travelers', 'Small Business Owners', 'Recently Moved', 'Online Shoppers']

function MetaTab({ data, onChange }: Props) {
  const objectiveInfo = META_OBJECTIVES[data.metaObjective] || META_OBJECTIVES['Leads']
  const usesInstantForm = data.metaConversionLocation.includes('Instant Forms')
  const usesWebsite = data.metaConversionLocation === 'Website' || data.metaConversionLocation.includes('Hybrid') || data.metaConversionLocation === 'Website & App'
  const usesCalls = data.metaConversionLocation === 'Calls'
  const showsDestination = usesInstantForm || usesWebsite

  const onObjectiveChange = (obj: string) => {
    const info = META_OBJECTIVES[obj]
    onChange({
      metaObjective: obj,
      metaConversionLocation: info.conversionLocations[0],
      metaOptimizationGoal: info.optimizationGoals[0],
    })
  }

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
          <span className="section-card-title">Meta — Facebook &amp; Instagram Configuration</span>
        </div>
        <span style={{ fontSize: 11, color: '#6d28d9', fontWeight: 600, background: '#f5f3ff', padding: '2px 8px', borderRadius: 4, border: '1px solid #ddd6fe' }}>Meta Marketing API</span>
      </div>
      <div className="section-card-body">

        <SubSection title="Objective &amp; Conversion">
          <FieldRow label="Meta Objective" badge={<Badge type="mandatory" />}
            helper="Locked once the campaign launches — changing it later requires rebuilding this channel's setup.">
            <select className="ht-select" value={data.metaObjective} onChange={e => onObjectiveChange(e.target.value)}>
              {Object.keys(META_OBJECTIVES).map(o => <option key={o}>{o}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Conversion Location" badge={<Badge type="mandatory" />}>
            <select className="ht-select" value={data.metaConversionLocation} onChange={e => onChange({ metaConversionLocation: e.target.value })}>
              {objectiveInfo.conversionLocations.map(c => <option key={c}>{c}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Optimization Goal" badge={<Badge type="mandatory" />}>
            <select className="ht-select" value={data.metaOptimizationGoal} onChange={e => onChange({ metaOptimizationGoal: e.target.value })}>
              {objectiveInfo.optimizationGoals.map(g => <option key={g}>{g}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Attribution Setting" badge={<Badge type="mandatory" condition="Only applies when optimizing for an off-platform conversion event" />}>
            <select className="ht-select" value={data.metaAttributionSetting} onChange={e => onChange({ metaAttributionSetting: e.target.value })}>
              <option>Standard (7-day click, 1-day view)</option>
              <option>Incremental (predicts causally-driven conversions)</option>
            </select>
          </FieldRow>
        </SubSection>

        <SubSection title="Audience">
          <CohortField data={data} value={data.metaCohort} onChange={v => onChange({ metaCohort: v })}
            options={['HTAuto_HighIntent_Apr26', 'Lookalike: Recent Purchasers']} />
          <FieldRow label="Locations" badge={<Badge type="mandatory" />}
            helper={data.metaGeoOverride ? 'Overriding the campaign geography for this channel only.' : `Inheriting campaign geography (set in Step 1): ${data.state}, ${data.city}, ${data.zone} zone.`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: data.metaGeoOverride ? 8 : 0 }}>
              <Toggle checked={data.metaGeoOverride} onChange={v => onChange({ metaGeoOverride: v })} />
              <span style={{ fontSize: 12.5, color: '#334155' }}>Override campaign geography for Meta</span>
            </div>
            {data.metaGeoOverride && (
              <SubSection title="Meta-specific geo targeting">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 5 }}>Include</div>
                    <ChipMultiSelect options={STATES_ALL} selected={data.metaGeoInclude} onChange={v => onChange({ metaGeoInclude: v })} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginBottom: 5 }}>Exclude</div>
                    <ChipMultiSelect options={STATES_ALL} selected={data.metaGeoExclude} onChange={v => onChange({ metaGeoExclude: v })} />
                  </div>
                </div>
              </SubSection>
            )}
          </FieldRow>
          <FieldRow label="Detailed Targeting" badge={<Badge type="optional" />}
            helper="Layers interest/behavior signals on top of the cohort or open targeting.">
            <ChipMultiSelect options={META_DETAILED_TARGETING_OPTIONS} selected={data.metaDetailedTargeting} onChange={v => onChange({ metaDetailedTargeting: v })} />
          </FieldRow>
          <FieldRow label="Age Range" badge={<Badge type="mandatory" />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="ht-input" value={data.metaAgeMin} onChange={e => onChange({ metaAgeMin: e.target.value })} placeholder="Min (13+)" style={{ fontFamily: 'var(--font-mono)' }} />
              <input className="ht-input" value={data.metaAgeMax} onChange={e => onChange({ metaAgeMax: e.target.value })} placeholder="Max (65+)" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
          </FieldRow>
          <FieldRow label="Gender" badge={<Badge type="mandatory" />}>
            <div style={{ display: 'flex', gap: 10 }}>
              {['All', 'Men', 'Women'].map(g => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="metaGender" value={g} checked={data.metaGender === g} onChange={() => onChange({ metaGender: g })} style={{ accentColor: '#8b5cf6' }} />
                  <span style={{ fontWeight: 500, color: '#334155' }}>{g}</span>
                </label>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Advantage+ Audience" badge={<Badge type="optional" />}
            helper="Lets Meta's AI expand delivery beyond the defined targeting when it finds likely converters.">
            <Toggle checked={data.metaAdvantageAudience} onChange={v => onChange({ metaAdvantageAudience: v })} />
          </FieldRow>
        </SubSection>

        <SubSection title="Placements &amp; Bidding">
          <FieldRow label="Placements" badge={<Badge type="mandatory" />}>
            <div style={{ display: 'flex', gap: 10, marginBottom: data.metaPlacementsMode === 'manual' ? 8 : 0 }}>
              {[{ v: 'advantage', l: 'Advantage+ Placements (automatic)' }, { v: 'manual', l: 'Manual' }].map(opt => (
                <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="metaPlacements" value={opt.v} checked={data.metaPlacementsMode === opt.v} onChange={() => onChange({ metaPlacementsMode: opt.v })} style={{ accentColor: '#8b5cf6' }} />
                  <span style={{ fontWeight: 500, color: '#334155' }}>{opt.l}</span>
                </label>
              ))}
            </div>
            {data.metaPlacementsMode === 'manual' && (
              <ChipMultiSelect options={META_PLACEMENT_OPTIONS} selected={data.metaManualPlacements} onChange={v => onChange({ metaManualPlacements: v })} />
            )}
          </FieldRow>
          <FieldRow label="Bid Strategy" badge={<Badge type="mandatory" />}>
            <select className="ht-select" value={data.metaBidStrategy} onChange={e => onChange({ metaBidStrategy: e.target.value })}>
              <option>Highest volume</option>
              <option>Cost per result goal</option>
              <option>Bid cap</option>
              {data.metaObjective === 'Sales' && <option>ROAS goal</option>}
            </select>
          </FieldRow>
          {(data.metaBidStrategy === 'Cost per result goal' || data.metaBidStrategy === 'Bid cap' || data.metaBidStrategy === 'ROAS goal') && (
            <FieldRow label={data.metaBidStrategy === 'ROAS goal' ? 'Target ROAS' : 'Bid Amount (₹)'} badge={<Badge type="mandatory" />}>
              <input className="ht-input" value={data.metaBidAmount} onChange={e => onChange({ metaBidAmount: e.target.value })} placeholder={data.metaBidStrategy === 'ROAS goal' ? 'e.g. 4.0' : 'e.g. 145'} style={{ fontFamily: 'var(--font-mono)' }} />
            </FieldRow>
          )}
        </SubSection>

        <SubSection title="Creative &amp; Copy">
          <FieldRow label="Identity (Page)" badge={<Badge type="mandatory" />}>
            <select className="ht-select" value={data.metaIdentityPage} onChange={e => onChange({ metaIdentityPage: e.target.value })}>
              <option>HT Auto — Official</option>
              <option>HT Tech — Official</option>
              <option>HT Education — Official</option>
            </select>
          </FieldRow>
          <FieldRow label="Ad Format" badge={<Badge type="mandatory" />}>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Single image or video', 'Carousel', 'Collection'].map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="metaFormat" value={f} checked={data.metaAdFormat === f} onChange={() => onChange({ metaAdFormat: f })} style={{ accentColor: '#8b5cf6' }} />
                  <span style={{ fontWeight: 500, color: '#334155' }}>{f}</span>
                </label>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Creative Upload" badge={<Badge type="mandatory" />}>
            <div style={{
              border: '2px dashed #ddd6fe', borderRadius: 6, padding: '18px 16px',
              textAlign: 'center', cursor: 'pointer', background: '#f5f3ff',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4, color: '#8b5cf6' }}>⬆</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#6d28d9' }}>Drop creative files here or click to upload</div>
              <div style={{ fontSize: 11, color: '#c4b5fd', marginTop: 3 }}>JPG, PNG, MP4 · 1080×1080 (Feed) · 1080×1920 (Reels/Stories)</div>
            </div>
          </FieldRow>
          <FieldRow label="Primary Text" badge={<Badge type="mandatory" />}>
            <textarea className="ht-input" rows={2} value={data.metaPrimaryText} onChange={e => onChange({ metaPrimaryText: e.target.value })} style={{ resize: 'vertical', fontSize: 13 }} />
          </FieldRow>
          <FieldRow label="Headline" badge={<Badge type="mandatory" />}>
            <input className="ht-input" value={data.metaHeadline} onChange={e => onChange({ metaHeadline: e.target.value })} />
          </FieldRow>
          <FieldRow label="Description" badge={<Badge type="optional" />}>
            <input className="ht-input" value={data.metaDescription} onChange={e => onChange({ metaDescription: e.target.value })} />
          </FieldRow>
          <FieldRow label="Call to Action" badge={<Badge type="mandatory" />}>
            <select className="ht-select" value={data.metaCta} onChange={e => onChange({ metaCta: e.target.value })}>
              {META_CTA_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FieldRow>
        </SubSection>

        <SubSection title="Destination">
          {usesInstantForm && (
            <>
              <FieldRow label="Instant Form Questions" badge={<Badge type="mandatory" />}
                helper="Fields a user fills in without leaving Facebook/Instagram.">
                <ChipMultiSelect
                  options={['Full name', 'Phone number', 'Email', 'City', 'Pincode', 'Preferred dealer', 'Best time to contact']}
                  selected={data.metaInstantFormFields}
                  onChange={v => onChange({ metaInstantFormFields: v })}
                />
              </FieldRow>
              <FieldRow label="Instant Form Privacy Policy URL" badge={<Badge type="mandatory" />}>
                <input className="ht-input" value={data.metaPrivacyPolicyUrl} onChange={e => onChange({ metaPrivacyPolicyUrl: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              </FieldRow>
            </>
          )}
          {usesWebsite && (
            <FieldRow label="Destination URL" badge={<Badge type="mandatory" />}>
              <input className="ht-input" value={data.metaDestinationUrl} onChange={e => onChange({ metaDestinationUrl: e.target.value })} placeholder="https://www.hondacarindia.com/city" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </FieldRow>
          )}
          {usesCalls && (
            <FieldRow label="Phone Number" badge={<Badge type="mandatory" />}>
              <input className="ht-input" placeholder="+91 98200 11234" style={{ fontFamily: 'var(--font-mono)' }} />
            </FieldRow>
          )}
          {!showsDestination && !usesCalls && (
            <div style={{ fontSize: 12.5, color: '#9ca3af', padding: '8px 0' }}>
              No external destination required for this conversion location — the outcome happens on-platform.
            </div>
          )}
          <FieldRow label="URL Parameters (UTM)" badge={<Badge type="optional" />}>
            <input className="ht-input" value={data.metaUtmParams} onChange={e => onChange({ metaUtmParams: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          </FieldRow>
        </SubSection>

        <FieldRow label="Channel Role" badge={<Badge type="mandatory" />}>
          <select className="ht-select" value={data.metaChannelRole} onChange={e => onChange({ metaChannelRole: e.target.value })}>
            <option>Primary Acquisition</option>
            <option>Verification / Nurture</option>
          </select>
        </FieldRow>
      </div>
    </div>
  )
}

// ─── Container ───────────────────────────────────────────────────────────────
export default function Step3Configure({ data, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<Channel>(data.selectedChannels[0] || 'Echo')

  const tabContent: Record<Channel, React.ReactNode> = {
    Echo: <EchoTab data={data} onChange={onChange} />,
    DSP: <DSPTab data={data} onChange={onChange} />,
    WhatsApp: <WhatsAppTab data={data} onChange={onChange} />,
    'Voice AI': <VoiceAITab data={data} onChange={onChange} />,
    Meta: <MetaTab data={data} onChange={onChange} />,
  }

  const channelCounts: Record<Channel, number> = {
    Echo: 10, DSP: 11, WhatsApp: 7, 'Voice AI': 8, Meta: 20,
  }

  return (
    <div>
      {/* Info banner */}
      <div style={{
        marginBottom: 16, padding: '10px 14px',
        background: '#f0f5fb', border: '1px solid #dce8f5', borderRadius: 6,
        fontSize: 12.5, color: '#1e40af',
      }}>
        Configure each selected channel below. Required fields <span style={{ fontWeight: 700 }}>must</span> be completed before launching. Conditional fields appear based on your campaign setup.
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 16,
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden',
      }}>
        {data.selectedChannels.map(ch => (
          <button
            key={ch}
            onClick={() => setActiveTab(ch)}
            style={{
              flex: 1, padding: '10px 16px',
              background: activeTab === ch ? `${CH_COLORS[ch]}12` : 'white',
              border: 'none', borderBottom: `2.5px solid ${activeTab === ch ? CH_COLORS[ch] : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: CH_COLORS[ch] }} />
            <span style={{
              fontSize: 13, fontWeight: activeTab === ch ? 700 : 500,
              color: activeTab === ch ? CH_COLORS[ch] : '#64748b',
              fontFamily: 'var(--font-display)',
            }}>{ch}</span>
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', marginLeft: 2,
              color: activeTab === ch ? CH_COLORS[ch] : '#94a3b8',
              opacity: 0.8,
            }}>{channelCounts[ch]}f</span>
          </button>
        ))}
      </div>

      {tabContent[activeTab]}
    </div>
  )
}
