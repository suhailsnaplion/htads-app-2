import { useEffect, useState } from 'react'
import { api } from '../api'

const CH_COLORS: Record<string, string> = {
  Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6',
}
const ALL_CHANNELS = ['Echo', 'DSP', 'WhatsApp', 'Voice AI', 'Meta']

type Severity = 'high' | 'medium' | 'low'
type Confidence = 'High' | 'Medium' | 'Low'

interface Insight {
  id: string
  category: string
  channels: string[]
  used: boolean
  severity: Severity
  title: string
  description: string
  impactLabel: string
  confidence: Confidence
  actionLabel: string
  dismissible?: boolean
}

const SEVERITY_STYLE: Record<Severity, { border: string; bg: string; label: string; labelColor: string }> = {
  high: { border: '#fecaca', bg: '#fef2f2', label: 'High impact', labelColor: '#dc2626' },
  medium: { border: '#fde68a', bg: '#fffbeb', label: 'Medium impact', labelColor: '#b45309' },
  low: { border: '#e2e8f0', bg: '#f8fafc', label: 'Low impact', labelColor: '#64748b' },
}

// Curated, detailed insight set for the flagship demo campaign (Honda City — Q3 Lead Gen).
// Channels in use: Echo, DSP, WhatsApp. Not in use: Voice AI, Meta.
const HONDA_CITY_INSIGHTS: Insight[] = [
  {
    id: 'realloc-dsp-wa', category: 'Reallocate Budget', channels: ['DSP', 'WhatsApp'], used: true, severity: 'high',
    title: 'Shift budget from DSP to WhatsApp',
    description: 'WhatsApp is converting 71% of reached users on this campaign vs. DSP\u2019s 45%. Both are optimizing toward the same lead-gen outcome, so the gap is a real efficiency signal, not a different goal being measured.',
    impactLabel: '+18% est. leads/month', confidence: 'High',
    actionLabel: 'Reallocate ₹1,00,000: DSP → WhatsApp',
  },
  {
    id: 'pacing-echo', category: 'Pacing Risk', channels: ['Echo'], used: true, severity: 'medium',
    title: 'Echo will exhaust its budget 9 days early',
    description: 'Echo has spent 82% of its ₹3,50,000 allocation with 12 days still left in the campaign. At the current daily burn rate, it runs out with over a week of the flight remaining.',
    impactLabel: '9 days of lost delivery', confidence: 'High',
    actionLabel: 'Increase Echo budget by ₹50,000',
  },
  {
    id: 'fatigue-echo', category: 'Creative Fatigue', channels: ['Echo'], used: true, severity: 'medium',
    title: 'Echo creative is showing fatigue',
    description: 'The current MOA banner creative has been live for 38 days. CTR is down 26% over the last two weeks — a pattern typically seen once a single creative passes the 30-day mark on repeat-exposure placements.',
    impactLabel: 'CTR recovery potential ~20%', confidence: 'Medium',
    actionLabel: 'Flag creative for refresh',
  },
  {
    id: 'overlap-echo-dsp', category: 'Audience Overlap', channels: ['Echo', 'DSP'], used: true, severity: 'low',
    title: 'Echo and DSP are targeting the same cohort',
    description: 'Both channels are pointed at HTAuto_HighIntent_Apr26 with overlapping placements. Estimated audience overlap is ~22%, meaning the two channels may be bidding against each other for the same retargeting impressions.',
    impactLabel: '~22% audience overlap', confidence: 'Medium',
    actionLabel: 'Restrict DSP to prospecting only',
  },
  {
    id: 'quality-dsp', category: 'Lead Quality', channels: ['DSP'], used: true, severity: 'medium',
    title: 'DSP leads show a high duplicate rate against Echo',
    description: 'DSP-sourced leads have a 34% duplicate rate (same phone number within 48 hours) against Echo, compared to 8% for Echo\u2019s own converters. This suggests DSP\u2019s retargeting pool overlaps heavily with people Echo has already converted.',
    impactLabel: '~34% duplicate leads', confidence: 'Medium',
    actionLabel: 'Exclude Echo converters from DSP audience',
  },
  {
    id: 'opportunity-voiceai', category: 'Channel Opportunity', channels: ['Voice AI'], used: false, severity: 'high',
    title: 'Voice AI could lift verified lead quality',
    description: 'Comparable HTAuto lead-gen campaigns that added Voice AI verification alongside Echo, DSP, and WhatsApp saw a 23% lift in Call-Verified leads on the Lead Quality Matrix. This campaign currently isn\u2019t using it.',
    impactLabel: '+23% verified lead quality (comparable campaigns)', confidence: 'Medium',
    actionLabel: 'Add Voice AI to this campaign',
  },
  {
    id: 'opportunity-meta', category: 'Channel Opportunity', channels: ['Meta'], used: false, severity: 'medium',
    title: 'Meta is a natural fit but unused here',
    description: 'This campaign\u2019s objective (CPL) maps cleanly to Meta\u2019s Leads objective, and 4 of 5 comparable HTAuto campaigns already include Meta. Estimated incremental reach in Maharashtra + Delhi NCR is ~2.1L users not currently covered by Echo/DSP/WhatsApp.',
    impactLabel: '~2.1L incremental reach (est.)', confidence: 'Low',
    actionLabel: 'Add Meta to this campaign',
  },
  {
    id: 'headroom-wa', category: 'Pacing Risk', channels: ['WhatsApp'], used: true, severity: 'low',
    title: 'WhatsApp has unused daily headroom',
    description: 'The 5,000/day rate limit on WhatsApp hasn\u2019t been hit on any day this month. Given it\u2019s also this campaign\u2019s highest-converting channel, there may be room to expand its cohort size before hitting a ceiling.',
    impactLabel: 'Headroom: ~5,000 msgs/day unused', confidence: 'Medium',
    actionLabel: 'Review WhatsApp cohort size',
  },
]

function genericInsightsForCampaign(campaign: any): Insight[] {
  const used: string[] = campaign.channels || []
  const notUsed = ALL_CHANNELS.filter(c => !used.includes(c))
  const insights: Insight[] = []

  if (campaign.status === 'at_risk') {
    insights.push({
      id: 'risk-status', category: 'Pacing Risk', channels: used, used: true, severity: 'high',
      title: 'Campaign is flagged At Risk',
      description: `This campaign has spent ₹${Number(campaign.spend_mtd).toLocaleString('en-IN')} of its ₹${Number(campaign.total_budget).toLocaleString('en-IN')} budget with ${campaign.leads || 0} tracked leads. Spend-to-outcome ratio is well outside the normal range for this business unit.`,
      impactLabel: 'Budget efficiency risk', confidence: 'High',
      actionLabel: 'Review targeting or pause campaign',
    })
  }
  if (campaign.status === 'paused') {
    insights.push({
      id: 'paused-status', category: 'Reallocate Budget', channels: used, used: true, severity: 'medium',
      title: 'Paused campaign is holding unused budget',
      description: `₹${Number(campaign.total_budget).toLocaleString('en-IN')} is allocated to a paused campaign. Consider reactivating it or reallocating the budget to an active campaign in the same business unit.`,
      impactLabel: 'Idle budget', confidence: 'Medium',
      actionLabel: 'Reallocate budget to an active campaign',
    })
  }
  notUsed.forEach(ch => {
    insights.push({
      id: `opportunity-${ch}`, category: 'Channel Opportunity', channels: [ch], used: false, severity: 'low',
      title: `${ch} isn\u2019t part of this campaign yet`,
      description: `${ch} isn\u2019t currently configured for this campaign. Compare against similar campaigns in this business unit to see if it\u2019s worth adding.`,
      impactLabel: 'Unassessed — no comparable data yet', confidence: 'Low',
      actionLabel: `Consider adding ${ch}`,
    })
  })
  return insights
}

interface Props { campaignId: string | null; onBack: () => void }

export default function IntelligencePanel({ campaignId, onBack }: Props) {
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dismissed, setDismissed] = useState<string[]>([])
  const [applied, setApplied] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    if (!campaignId) { setLoading(false); return }
    api.getCampaign(campaignId)
      .then(res => { if (!cancelled) setCampaign(res.campaign) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this campaign') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [campaignId])

  if (loading) return <div style={{ padding: 28, fontSize: 13, color: '#94a3b8' }}>Loading campaign intelligence…</div>
  if (error || !campaign) {
    return (
      <div style={{ padding: 28 }}>
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12.5, color: '#dc2626' }}>
          {error || 'Campaign not found.'}
        </div>
      </div>
    )
  }

  const insights = campaign.id === 'CMP-2291' ? HONDA_CITY_INSIGHTS : genericInsightsForCampaign(campaign)
  const visible = insights.filter(i => !dismissed.includes(i.id))
  const highCount = visible.filter(i => i.severity === 'high').length
  const usedChannels: string[] = campaign.channels || []
  const notUsedChannels = ALL_CHANNELS.filter(c => !usedChannels.includes(c))

  const usedInsights = visible.filter(i => i.used)
  const opportunityInsights = visible.filter(i => !i.used)

  const applyAction = (id: string) => setApplied(a => [...a, id])
  const dismissAction = (id: string) => setDismissed(d => [...d, id])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200 }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 16, fontSize: 12.5 }}>← Back to Dashboard</button>

      {/* Campaign header */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '18px 20px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0f2044' }}>{campaign.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#94a3b8' }}>{campaign.id}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>{campaign.business_unit}</span>
            {ALL_CHANNELS.map(ch => (
              <span key={ch} style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: usedChannels.includes(ch) ? `${CH_COLORS[ch]}15` : '#f8fafc',
                color: usedChannels.includes(ch) ? CH_COLORS[ch] : '#cbd5e1',
                border: `1px solid ${usedChannels.includes(ch) ? CH_COLORS[ch] + '40' : '#e2e8f0'}`,
              }}>{ch}{!usedChannels.includes(ch) ? ' (unused)' : ''}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Budget · Spend MTD · Leads</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#0f172a', marginTop: 4 }}>
            ₹{Number(campaign.total_budget).toLocaleString('en-IN')} · ₹{Number(campaign.spend_mtd).toLocaleString('en-IN')} · {campaign.leads || 0}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        background: '#0f2044', color: 'white', borderRadius: 8, padding: '14px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{visible.length} insight{visible.length !== 1 ? 's' : ''} found</span>
        </div>
        <div style={{ fontSize: 12.5, color: '#fca5a5' }}>{highCount} high-impact</div>
        <div style={{ fontSize: 12.5, color: '#B9C1E6' }}>Covers all 5 channels — {usedChannels.length} active, {notUsedChannels.length} unused</div>
      </div>

      {/* Active channel insights */}
      {usedInsights.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Optimize active channels
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {usedInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} isApplied={applied.includes(insight.id)} onApply={() => applyAction(insight.id)} onDismiss={() => dismissAction(insight.id)} />
            ))}
          </div>
        </>
      )}

      {/* Unused channel opportunities */}
      {opportunityInsights.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Channel opportunities (not currently used on this campaign)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {opportunityInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} isApplied={applied.includes(insight.id)} onApply={() => applyAction(insight.id)} onDismiss={() => dismissAction(insight.id)} />
            ))}
          </div>
        </>
      )}

      {visible.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          No open insights for this campaign right now.
        </div>
      )}
    </div>
  )
}

function InsightCard({ insight, isApplied, onApply, onDismiss }: { insight: Insight; isApplied: boolean; onApply: () => void; onDismiss: () => void }) {
  const sev = SEVERITY_STYLE[insight.severity]
  return (
    <div style={{
      background: 'white', border: `1px solid ${insight.used ? sev.border : '#ddd6fe'}`, borderRadius: 8,
      borderLeft: `4px solid ${insight.used ? sev.labelColor : '#8b5cf6'}`,
      padding: '16px 18px', opacity: isApplied ? 0.55 : 1, transition: 'opacity 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: sev.bg, color: sev.labelColor, textTransform: 'uppercase', letterSpacing: '0.03em',
            }}>{sev.label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{insight.category}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {insight.channels.map(ch => (
                <span key={ch} style={{ width: 7, height: 7, borderRadius: '50%', background: CH_COLORS[ch], display: 'inline-block' }} title={ch} />
              ))}
            </div>
            {!insight.used && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', padding: '2px 7px', borderRadius: 4 }}>Not currently used</span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>{insight.title}</div>
          <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.6, margin: 0, maxWidth: 720 }}>{insight.description}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ fontSize: 11.5, color: '#334155' }}><strong style={{ color: '#0f172a' }}>Est. impact:</strong> {insight.impactLabel}</div>
            <div style={{ fontSize: 11.5, color: '#334155' }}><strong style={{ color: '#0f172a' }}>Confidence:</strong> {insight.confidence}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, minWidth: 190 }}>
          {isApplied ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d', textAlign: 'center' }}>✓ Queued for action</span>
          ) : (
            <>
              <button className="btn-primary" style={{ fontSize: 12, whiteSpace: 'nowrap' }} onClick={onApply}>{insight.actionLabel}</button>
              <button className="btn-secondary" style={{ fontSize: 11.5 }} onClick={onDismiss}>Dismiss</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
