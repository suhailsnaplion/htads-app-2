import { useState } from 'react'
import type { CampaignFormData, Channel } from '../../types'

interface Props {
  data: CampaignFormData
  onChange: (patch: Partial<CampaignFormData>) => void
  onLaunch: () => void
  onEdit: (step: number) => void
}

const CH_COLORS: Record<Channel, string> = {
  Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6',
}

const CH_ICONS: Record<Channel, string> = {
  Echo: '◎', DSP: '◫', WhatsApp: '◉', 'Voice AI': '◐', Meta: '◑',
}

const CAMPAIGN_ID = 'CMP-2292'

const PREFLIGHT_ITEMS = [
  {
    id: 'budget',
    label: 'Budget allocation verified',
    desc: 'Total allocated across channels does not exceed campaign budget.',
  },
  {
    id: 'creative',
    label: 'Creatives reviewed and approved',
    desc: 'All uploaded creatives meet property spec requirements and brand guidelines.',
  },
  {
    id: 'compliance',
    label: 'Compliance and regulatory sign-off',
    desc: 'Campaign content adheres to TRAI, ASCI, and platform-specific ad policies.',
  },
  {
    id: 'tracking',
    label: 'UTM tracking and attribution confirmed',
    desc: 'UTM parameters are configured and postback endpoints (where applicable) are tested.',
  },
  {
    id: 'audience',
    label: 'Audience segments and cohorts validated',
    desc: 'Selected cohorts are refreshed and contain the expected user counts.',
  },
]

function ReviewSection({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#f8fafc',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>{title}</span>
        <button onClick={() => onEdit(step)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#2952a3', cursor: 'pointer', fontWeight: 600 }}>✎ Edit</button>
      </div>
      <div style={{ padding: '10px 16px' }}>{children}</div>
    </div>
  )
}

function KV({ label, value, mono }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 8, padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: '#0f172a', fontFamily: mono ? 'var(--font-mono)' : undefined }}>
        {value || <span style={{ color: '#cbd5e1' }}>—</span>}
      </span>
    </div>
  )
}

function ChannelConfigSummary({ ch, data }: { ch: Channel; data: CampaignFormData }) {
  const color = CH_COLORS[ch]
  const budget = parseInt(data.channelBudgets[ch] || '0', 10)

  const renderLines = () => {
    if (ch === 'Echo') return [
      { k: 'Property', v: data.echoProperty },
      { k: 'Platform', v: data.echoPlatform },
      { k: 'Position', v: data.echoPosition },
      { k: 'Creative type', v: data.echoCreativeType },
      { k: 'Cohort', v: data.echoCohort || 'None' },
      { k: 'Schedule', v: data.echoScheduleEnabled ? `${data.echoDaySchedule.join(', ')} · ${data.echoTimeStart}–${data.echoTimeEnd}` : 'Always on' },
      { k: 'Freq cap', v: data.echoFreqCapEnabled ? `${data.echoFreqSession} / session · ${data.echoFreqDaily} / day · ${data.echoFreqWeekly} / week` : 'Disabled' },
      { k: 'A/B experiment', v: data.echoExperimentEnabled ? `${data.echoAbSplit}% A / ${100 - parseInt(data.echoAbSplit || '50', 10)}% B` : 'Disabled' },
      { k: 'Form fields', v: data.echoFormFields.join(', ') || 'None' },
      { k: 'UTM source', v: data.echoUtmSource || '—' },
    ]
    if (ch === 'DSP') return [
      { k: 'Audience type', v: data.dspAudienceType },
      { k: 'Cohort', v: data.dspCohort || 'None' },
      { k: 'Media type', v: data.dspMediaType },
      { k: 'Bidding', v: `${data.dspBiddingType} · bid cap ₹${data.dspBidCap}` },
      { k: 'Optimization goal', v: data.dspOptimizationGoal },
      { k: 'Attribution', v: data.dspAttributionMethod },
      { k: 'Brand safety', v: data.dspBrandSafety },
      { k: 'Viewability', v: data.dspViewability },
      { k: 'Freq cap', v: data.dspFreqCap || 'None' },
    ]
    if (ch === 'WhatsApp') return [
      { k: 'Template', v: data.waTemplateId },
      { k: 'Value method', v: data.waValueMethod },
      { k: 'Send window', v: `${data.waTimeStart} – ${data.waTimeEnd}` },
      { k: 'Daily limit', v: data.waDailyLimit ? `${parseInt(data.waDailyLimit, 10).toLocaleString()} messages` : 'No cap' },
    ]
    if (ch === 'Voice AI') return [
      { k: 'Script', v: data.voiceScriptId },
      { k: 'Cohort', v: data.voiceCohort },
      { k: 'Calling hours', v: `${data.voiceCallStart} – ${data.voiceCallEnd}` },
      { k: 'Max retries', v: `${data.voiceMaxRetries} attempt(s), ${data.voiceRetryDelay} min delay` },
      { k: 'Outcome mapping', v: data.voiceOutcomeMapping },
    ]
    if (ch === 'Meta') return [
      { k: 'Channel role', v: data.metaChannelRole },
      { k: 'Configuration', v: 'Phase 1 — managed in Meta Ads Manager' },
    ]
    return []
  }

  return (
    <div style={{
      border: `1px solid ${color}25`, borderRadius: 7, overflow: 'hidden', marginBottom: 10,
    }}>
      <div style={{
        background: `${color}0a`, borderBottom: `1px solid ${color}18`,
        padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044', flex: 1 }}>{ch}</span>
        <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500 }}>{data.channelRoles[ch]}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: color }}>
          ₹{budget.toLocaleString('en-IN')}
        </span>
      </div>
      <div style={{ padding: '8px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
        {renderLines().map(l => (
          <div key={l.k} style={{ display: 'flex', gap: 6, padding: '3px 0', borderBottom: '1px solid #f8fafc' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 96, flexShrink: 0 }}>{l.k}</span>
            <span style={{ fontSize: 11.5, color: '#334155', fontFamily: typeof l.v === 'string' && /[₹\d]/.test(l.v.charAt(0)) ? 'var(--font-mono)' : undefined }}>{l.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Step4Review({ data, onChange, onLaunch, onEdit }: Props) {
  const [launching, setLaunching] = useState(false)

  const fmt = (n: string) => {
    const num = parseInt(n.replace(/,/g, '') || '0', 10)
    return `₹${num.toLocaleString('en-IN')}`
  }

  const totalBudget = parseInt(data.totalBudget || '0', 10)
  const allocated = data.selectedChannels.reduce((sum, ch) => sum + parseInt(data.channelBudgets[ch] || '0', 10), 0)
  const remaining = totalBudget - allocated
  const allocPct = totalBudget > 0 ? Math.min(100, (allocated / totalBudget) * 100) : 0

  const allPreflightChecked = PREFLIGHT_ITEMS.every(item => data.preflightChecked.includes(item.id))

  const togglePreflight = (id: string) => {
    const next = data.preflightChecked.includes(id)
      ? data.preflightChecked.filter(x => x !== id)
      : [...data.preflightChecked, id]
    onChange({ preflightChecked: next })
  }

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => {
      setLaunching(false)
      onLaunch()
    }, 1600)
  }

  return (
    <div>
      {/* Campaign ID header */}
      <div style={{
        marginBottom: 16, padding: '12px 16px',
        background: '#0f2044', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Campaign ID</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'white' }}>{CAMPAIGN_ID}</div>
        </div>
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)' }} />
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Campaign Name</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'var(--font-display)' }}>{data.campaignName}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {data.selectedChannels.map(ch => (
            <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CH_COLORS[ch] }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)' }}>{ch}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign config */}
      <ReviewSection title="1 · Identity &amp; Ownership" step={1} onEdit={onEdit}>
        <KV label="Campaign Name" value={data.campaignName} />
        <KV label="Category" value={data.businessUnit} />
        <KV label="Deal Type" value={data.dealType} />
        {data.dealType === 'Agency' && <KV label="Agency Code" value={data.agencyCode} mono />}
      </ReviewSection>

      <ReviewSection title="2 · Objective &amp; Monetization" step={1} onEdit={onEdit}>
        <KV label="Objective" value={data.objective} />
        <KV label="Goal Layer" value={data.goalLayer} />
        <KV label="Attribution Method" value={data.attributionMethod} />
        <KV label="Unit Price" value={`₹${data.unitPrice}`} mono />
        <KV label="Target Volume" value={`${parseInt(data.targetVolume || '0', 10).toLocaleString('en-IN')} units`} mono />
        <KV label="Total Budget" value={fmt(data.totalBudget)} mono />
        <KV label="Auto Budget Allocation" value={data.autoBudgetAllocation ? 'Enabled' : 'Disabled'} />
      </ReviewSection>

      <ReviewSection title="3 · Timing &amp; Geography" step={1} onEdit={onEdit}>
        <KV label="Start Date" value={new Date(data.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
        <KV label="End Date" value={new Date(data.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
        <KV label="State" value={data.state} />
        <KV label="City" value={data.city} />
        <KV label="Zone" value={data.zone} />
        {data.pincode && <KV label="Pincode" value={data.pincode} mono />}
        {data.drrCap && <KV label="DRR Cap" value={`${data.drrCap} leads/day`} />}
      </ReviewSection>

      {(data.utmSource || data.utmCampaign || data.utmMedium) && (
        <ReviewSection title="4 · UTM Tracking" step={1} onEdit={onEdit}>
          <KV label="UTM Source" value={data.utmSource} />
          <KV label="UTM Campaign" value={data.utmCampaign} />
          <KV label="UTM Medium" value={data.utmMedium} />
          <KV label="Google Sheets Export" value={data.autoExportSheets ? 'Enabled' : 'Disabled'} />
        </ReviewSection>
      )}

      {data.businessUnit === 'HTAuto' && (
        <ReviewSection title="5 · HTAuto Configuration" step={1} onEdit={onEdit}>
          <KV label="Client" value={data.htAutoClient} />
          <KV label="Vehicle Type" value={data.vehicleType} />
          <KV label="Model Visibility" value={data.modelVisibility} />
          <KV label="Selected Models" value={
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {data.selectedModels.map(m => <span key={m} style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{m}</span>)}
            </div>
          } />
          <KV label="Competitor Mapping" value={
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {data.competitorMapping.map(c => <span key={c} style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{c}</span>)}
            </div>
          } />
          <KV label="Duplicacy Keys" value={data.duplicacyKeys.join(', ')} />
          <KV label="Sampling" value={data.samplingEnabled ? 'Enabled' : 'Disabled'} />
        </ReviewSection>
      )}

      {/* Channel budget summary */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8fafc',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>Channel Selection &amp; Budget</span>
          <button onClick={() => onEdit(2)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#2952a3', cursor: 'pointer', fontWeight: 600 }}>✎ Edit</button>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {/* Budget bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>Budget allocation</span>
              <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: '#334155', fontWeight: 600 }}>
                {fmt(allocated.toString())} / {fmt(data.totalBudget)} allocated
              </span>
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${allocPct}%`, background: allocPct > 95 ? '#dc2626' : '#1b3a6b', borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {data.selectedChannels.map(ch => {
                const chBudget = parseInt(data.channelBudgets[ch] || '0', 10)
                const pct = totalBudget > 0 ? ((chBudget / totalBudget) * 100).toFixed(0) : '0'
                return (
                  <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: CH_COLORS[ch], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#475569' }}>{ch}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#64748b' }}>{pct}%</span>
                  </div>
                )
              })}
              {remaining > 0 && (
                <div style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                  ₹{remaining.toLocaleString('en-IN')} unallocated
                </div>
              )}
            </div>
          </div>

          {/* Channel rows */}
          {data.selectedChannels.map(ch => (
            <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9', marginBottom: 6 }}>
              <span style={{ fontSize: 16, color: CH_COLORS[ch] }}>{CH_ICONS[ch]}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044', flex: 1 }}>{ch}</span>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>{data.channelRoles[ch]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#0f172a', fontWeight: 600 }}>
                ₹{parseInt(data.channelBudgets[ch] || '0', 10).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Channel configuration details */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8fafc',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>Channel Configuration Summary</span>
          <button onClick={() => onEdit(3)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#2952a3', cursor: 'pointer', fontWeight: 600 }}>✎ Edit</button>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {data.selectedChannels.map(ch => (
            <ChannelConfigSummary key={ch} ch={ch} data={data} />
          ))}
        </div>
      </div>

      {/* Budget totals */}
      <div style={{
        background: '#0f2044', borderRadius: 8, padding: '16px 20px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20,
      }}>
        {[
          { label: 'Total Campaign Budget', value: fmt(data.totalBudget) },
          { label: 'Allocated Across Channels', value: `₹${allocated.toLocaleString('en-IN')}` },
          { label: 'Remaining / Unallocated', value: `₹${Math.max(0, remaining).toLocaleString('en-IN')}` },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'white' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pre-flight checklist */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>✈</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>Pre-flight Checklist</span>
          <span style={{ marginLeft: 'auto', fontSize: 11.5, fontFamily: 'var(--font-mono)', color: allPreflightChecked ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
            {data.preflightChecked.length} / {PREFLIGHT_ITEMS.length} certified
          </span>
        </div>
        <div style={{ padding: '6px 16px 12px' }}>
          <div style={{ fontSize: 12, color: '#64748b', padding: '8px 0 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 8 }}>
            Certify each item before launching. By checking, you confirm that you have personally verified this item.
          </div>
          {PREFLIGHT_ITEMS.map(item => {
            const checked = data.preflightChecked.includes(item.id)
            return (
              <div
                key={item.id}
                onClick={() => togglePreflight(item.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0',
                  borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${checked ? '#16a34a' : '#d1d5db'}`,
                  background: checked ? '#16a34a' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {checked && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: checked ? 600 : 500, color: checked ? '#15803d' : '#0f172a', transition: 'color 0.15s' }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            )
          })}

          {!allPreflightChecked && (
            <div style={{
              marginTop: 10, padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 5, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ⚠ Complete all {PREFLIGHT_ITEMS.length} checklist items to enable launch.
            </div>
          )}

          {allPreflightChecked && (
            <div style={{
              marginTop: 10, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 5, fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ✓ All items certified. Campaign is ready to launch.
            </div>
          )}
        </div>
      </div>

      {/* Launch button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          Campaign ID: <span style={{ fontFamily: 'var(--font-mono)', color: '#334155', fontWeight: 600 }}>{CAMPAIGN_ID}</span>
          <span style={{ margin: '0 8px' }}>·</span>
          {data.selectedChannels.length} channel{data.selectedChannels.length !== 1 ? 's' : ''} selected
          <span style={{ margin: '0 8px' }}>·</span>
          {fmt(data.totalBudget)} total budget
        </div>
        <button
          className={allPreflightChecked ? 'btn-primary' : 'btn-secondary'}
          style={{
            padding: '10px 28px', fontSize: 14,
            background: allPreflightChecked ? '#dc2626' : undefined,
            opacity: allPreflightChecked ? 1 : 0.6,
            cursor: allPreflightChecked ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          disabled={!allPreflightChecked || launching}
          onClick={handleLaunch}
        >
          {launching ? (
            <>
              <span style={{
                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: 'white', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.6s linear infinite',
              }} />
              Launching…
            </>
          ) : (
            <>{allPreflightChecked ? '🚀' : '🔒'} Launch Campaign</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
