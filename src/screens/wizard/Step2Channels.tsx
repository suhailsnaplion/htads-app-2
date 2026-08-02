import Badge from '../../components/Badge'
import type { CampaignFormData, Channel } from '../../types'

interface Props {
  data: CampaignFormData
  onChange: (patch: Partial<CampaignFormData>) => void
}

const CHANNELS: { id: Channel; color: string; icon: string; desc: string }[] = [
  { id: 'Echo', color: '#6366f1', icon: '◎', desc: 'On-site placements across HT digital properties — banners, popups, interstitials.' },
  { id: 'DSP', color: '#0ea5e9', icon: '◫', desc: 'Programmatic display & video across open web inventory via HT DSP.' },
  { id: 'WhatsApp', color: '#22c55e', icon: '◉', desc: 'Templated outbound messaging to opted-in users via WhatsApp Business API.' },
  { id: 'Voice AI', color: '#f59e0b', icon: '◐', desc: 'Automated outbound IVR/AI voice calls for lead verification and qualification.' },
  { id: 'Meta', color: '#8b5cf6', icon: '◑', desc: 'Facebook & Instagram ads. Phase 1: selection only — configure in Meta Ads Manager.' },
]

const ROLES = ['Primary Acquisition', 'Verification / Nurture']

export default function Step2Channels({ data, onChange }: Props) {
  const totalBudget = parseInt(data.totalBudget.replace(/,/g, '') || '0', 10)
  const allocated = data.selectedChannels.reduce((sum, ch) => {
    return sum + parseInt((data.channelBudgets[ch] || '0').replace(/,/g, ''), 10)
  }, 0)
  const remaining = totalBudget - allocated
  const overBudget = allocated > totalBudget && totalBudget > 0

  const toggleChannel = (ch: Channel) => {
    const sel = data.selectedChannels.includes(ch)
      ? data.selectedChannels.filter(c => c !== ch)
      : [...data.selectedChannels, ch]
    onChange({ selectedChannels: sel })
  }

  return (
    <div>
      <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0f5fb', border: '1px solid #dce8f5', borderRadius: 6, fontSize: 12.5, color: '#1e40af' }}>
        Select one or more channels for this campaign. Each selected channel will need configuration in Step 3.
        Allocate budget per channel — total must not exceed <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{totalBudget.toLocaleString('en-IN')}</strong>.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {CHANNELS.map(ch => {
          const isSelected = data.selectedChannels.includes(ch.id)
          return (
            <div
              key={ch.id}
              style={{
                background: 'white',
                border: `1.5px solid ${isSelected ? ch.color : '#e2e8f0'}`,
                borderRadius: 8,
                overflow: 'hidden',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? `0 0 0 3px ${ch.color}18` : 'none',
              }}
            >
              {/* Channel header row */}
              <div
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => toggleChannel(ch.id)}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4,
                  border: `2px solid ${isSelected ? ch.color : '#d1d5db'}`,
                  background: isSelected ? ch.color : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}>
                  {isSelected && <span style={{ color: 'white', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${ch.color}15`, border: `1px solid ${ch.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: ch.color, flexShrink: 0,
                }}>{ch.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0f2044', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ch.color, display: 'inline-block' }} />
                    {ch.id}
                    {ch.id === 'Meta' && (
                      <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Phase 1 — Selection only</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ch.desc}</div>
                </div>
                {isSelected && (
                  <span style={{ fontSize: 11, color: ch.color, fontWeight: 600, flexShrink: 0 }}>Selected ✓</span>
                )}
              </div>

              {/* Expanded config when selected */}
              {isSelected && (
                <div style={{ borderTop: `1px solid ${ch.color}25`, background: `${ch.color}06`, padding: '14px 16px 14px 52px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                        Channel Role <Badge type="mandatory" />
                      </label>
                      <select
                        className="ht-select"
                        value={data.channelRoles[ch.id]}
                        onChange={e => onChange({ channelRoles: { ...data.channelRoles, [ch.id]: e.target.value } })}
                      >
                        <option value="">Select role</option>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                        Channel Budget Allocation <Badge type="mandatory" />
                      </label>
                      <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                        <span style={{ padding: '6px 10px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'var(--font-mono)', color: '#334155' }}>₹</span>
                        <input
                          className="ht-input"
                          value={data.channelBudgets[ch.id] || ''}
                          onChange={e => onChange({ channelBudgets: { ...data.channelBudgets, [ch.id]: e.target.value } })}
                          placeholder="0"
                          style={{ border: 'none', borderRadius: 0, fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
