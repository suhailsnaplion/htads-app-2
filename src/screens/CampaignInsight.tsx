import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { api } from '../api'
import {
  generateWhatsAppPerf, generateDspPerf, generateEchoPerf,
  type ChannelPerf, type AudienceRow, type CreativeRow,
} from '../lib/perfData'

const CH_COLORS: Record<string, string> = {
  Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6',
}
const LINE_COLORS = ['#0f2044', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#dc2626']

function outcomeLabelForObjective(objective: string): string {
  if (objective.startsWith('CPL') || objective.startsWith('CPQL')) return 'Leads'
  if (objective.startsWith('CPS')) return 'Sales'
  if (objective === 'CPA – Transaction') return 'Transactions'
  if (objective === 'CPA – App Download' || objective.startsWith('CPI')) return 'Installs'
  if (objective === 'CPA – Sign Up') return 'Sign-ups'
  if (objective === 'CPA – Form Submit') return 'Form Submissions'
  if (objective === 'CPA – Subscription') return 'Subscriptions'
  if (objective.startsWith('CPC')) return 'Clicks'
  return 'Engagements'
}

const fmt = (n: number) => n.toLocaleString('en-IN')
const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

interface Props { campaignId: string | null; onBack: () => void }

export default function CampaignInsight({ campaignId, onBack }: Props) {
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!campaignId) { setLoading(false); return }
    api.getCampaign(campaignId)
      .then(res => { if (!cancelled) setCampaign(res.campaign) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this campaign') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [campaignId])

  if (loading) return <div style={{ padding: 28, fontSize: 13, color: '#94a3b8' }}>Loading campaign performance…</div>
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

  const channels: string[] = campaign.channels || []
  const objective: string = campaign.form_data?.objective || 'CPL – Cost per Lead'
  const outcomeLabel = outcomeLabelForObjective(objective)
  const seedBase = campaign.id

  const perfList: ChannelPerf[] = channels.map(ch => {
    if (ch === 'WhatsApp') {
      const messages = campaign.id === 'CMP-2291'
        ? [{ label: 'lead_confirmation_v2', templateId: 'lead_confirmation_v2', cohort: 'HTAuto_HighIntent_Apr26' }, { label: 'otp_verification', templateId: 'otp_verification', cohort: 'Realtime: Form Abandoners' }]
        : [{ label: 'lead_confirmation_v2', templateId: 'lead_confirmation_v2', cohort: 'HTAuto_HighIntent_Apr26' }]
      return generateWhatsAppPerf(`${seedBase}-wa`, outcomeLabel, messages)
    }
    if (ch === 'DSP' || ch === 'Meta') {
      const inventories = campaign.id === 'CMP-2291' && ch === 'DSP'
        ? [{ label: 'Display · CPM ₹85', mediaType: 'Display' }]
        : [{ label: `${ch} — Primary buy`, mediaType: 'Display' }, { label: `${ch} — Video`, mediaType: 'Video' }]
      return generateDspPerf(`${seedBase}-${ch}`, outcomeLabel, inventories, 'HTAuto_HighIntent_Apr26', ch === 'DSP')
    }
    if (ch === 'Echo') {
      const inventories = [{ label: 'Top Banner · HTAuto Web', creativeType: 'Image' }, { label: 'Interstitial · HT App', creativeType: 'Video' }]
      return generateEchoPerf(`${seedBase}-echo`, outcomeLabel, inventories)
    }
    return generateEchoPerf(`${seedBase}-${ch}`, outcomeLabel, [{ label: 'IVR Script — Primary', creativeType: 'Voice' }])
  })

  const totalCost = perfList.reduce((s, p) => s + p.totalCost, 0)
  const totalRevenue = perfList.reduce((s, p) => s + p.totalRevenue, 0)
  const overallRoi = totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0

  const dayCount = perfList[0]?.daily.length || 21
  const combinedDaily = Array.from({ length: dayCount }, (_, i) => {
    const date = perfList[0]?.daily[i]?.date || `Day ${i + 1}`
    let cost = 0, revenue = 0
    perfList.forEach(p => { cost += Number(p.daily[i]?.Cost || 0); revenue += Number(p.daily[i]?.Revenue || 0) })
    return { date, cost, revenue }
  })
  let cumCost = 0, cumRevenue = 0
  const cumulativeDaily = combinedDaily.map(d => {
    cumCost += d.cost; cumRevenue += d.revenue
    return { date: d.date, 'Cumulative Cost': cumCost, 'Cumulative Revenue': cumRevenue }
  })

  const bestChannel = [...perfList].sort((a, b) => b.roiPct - a.roiPct)[0]
  const worstChannel = [...perfList].sort((a, b) => a.roiPct - b.roiPct)[0]

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1240 }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 16, fontSize: 12.5 }}>← Back to Dashboard</button>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '18px 20px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0f2044' }}>{campaign.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#94a3b8' }}>{campaign.id}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>{campaign.business_unit}</span>
            {channels.map(ch => (
              <span key={ch} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${CH_COLORS[ch]}15`, color: CH_COLORS[ch], border: `1px solid ${CH_COLORS[ch]}40` }}>{ch}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Budget · Spend MTD</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#0f172a', marginTop: 4 }}>
            {rupee(campaign.total_budget)} · {rupee(campaign.spend_mtd)}
          </div>
        </div>
      </div>

      <div style={{ background: '#0f2044', color: 'white', borderRadius: 8, padding: '16px 20px', marginBottom: 12, display: 'flex', gap: 32, alignItems: 'center' }}>
        <SummaryStat label="Total Cost" value={rupee(totalCost)} />
        <SummaryStat label="Total Revenue" value={rupee(totalRevenue)} />
        <SummaryStat label="Overall ROI" value={`${overallRoi}%`} highlight={overallRoi >= 0} />
        <SummaryStat label="Best Channel" value={`${bestChannel.channel} (${bestChannel.roiPct}%)`} />
      </div>

      <Panel title="Cost vs. Revenue — cumulative, all channels">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={cumulativeDaily} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10.5, fill: '#94a3b8' }} interval={2} />
            <YAxis tick={{ fontSize: 10.5, fill: '#94a3b8' }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: any) => rupee(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Cumulative Cost" stroke="#dc2626" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Cumulative Revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Channel comparison">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Channel', 'Cost', 'Revenue', 'ROI', outcomeLabel].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Channel' ? 'left' : 'right', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perfList.map(p => {
              const totalConv = p.audienceRows.reduce((s, r) => s + r.conversions, 0)
              return (
                <tr key={p.channel} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CH_COLORS[p.channel] }} />{p.channel}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{rupee(p.totalCost)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{rupee(p.totalRevenue)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: p.roiPct >= 0 ? '#16a34a' : '#dc2626' }}>{p.roiPct}%</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(totalConv)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Panel>

      <Panel title="Overall key takeaways">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.9 }}>
          <li><strong>{bestChannel.channel}</strong> is delivering the best return at <strong>{bestChannel.roiPct}% ROI</strong> — consider shifting incremental budget its way.</li>
          <li><strong>{worstChannel.channel}</strong> is the weakest performer at <strong>{worstChannel.roiPct}% ROI</strong>{worstChannel.channel !== bestChannel.channel ? ' — worth a closer look at its audience/creative tables below.' : '.'}</li>
          <li>Blended campaign ROI is <strong>{overallRoi}%</strong> on {rupee(totalCost)} spent across {channels.length} channel{channels.length !== 1 ? 's' : ''} to date.</li>
        </ul>
      </Panel>

      {perfList.map(p => (
        <ChannelSection key={p.channel} perf={p} />
      ))}
    </div>
  )
}

function SummaryStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: '#B9C1E6', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, marginTop: 3, color: highlight === false ? '#fca5a5' : 'white' }}>{value}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 18px', marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f2044', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function ChannelSection({ perf }: { perf: ChannelPerf }) {
  const color = CH_COLORS[perf.channel]
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#0f2044' }}>{perf.channel}</span>
      </div>

      <Panel title={`Day-on-day performance (${perf.primaryMetrics.join(' · ')})`}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={perf.daily} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} />
            <YAxis tick={{ fontSize: 10.5, fill: '#94a3b8' }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 11.5 }} />
            {perf.primaryMetrics.map((m, i) => (
              <Line key={m} type="monotone" dataKey={m} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 24, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
          {perf.primaryMetrics.map(m => {
            const total = perf.daily.reduce((s, d) => s + Number(d[m] || 0), 0)
            const avg = Math.round(total / perf.daily.length)
            return (
              <div key={m}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m} (total · daily avg)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{fmt(total)} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {fmt(avg)}/day</span></div>
              </div>
            )
          })}
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Panel title="Audience / Cohort performance">
          <AudienceTable rows={perf.audienceRows} />
        </Panel>
        <Panel title={perf.creativeTableTitle}>
          <CreativeBarAndTable rows={perf.creativeRows} color={color} />
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Panel title="Post-click funnel">
          <PostClickFunnel stages={perf.postClick.stages} color={color} />
          <div style={{ display: 'flex', gap: 20, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Avg. Ticket Size</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{rupee(perf.postClick.avgTicketSize)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Revenue (this funnel)</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{rupee(perf.postClick.revenue)}</div>
            </div>
          </div>
        </Panel>
        <Panel title="ROI — cost invested vs. revenue generated">
          <div style={{ display: 'flex', gap: 24, marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Total Cost</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{rupee(perf.totalCost)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Total Revenue</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{rupee(perf.totalRevenue)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>ROI</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: perf.roiPct >= 0 ? '#16a34a' : '#dc2626' }}>{perf.roiPct}%</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={perf.daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 9.5, fill: '#94a3b8' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: any) => rupee(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Cost" fill="#dc2626" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Revenue" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title={`${perf.channel} — key takeaways`}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.9 }}>
          {perf.takeaways.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </Panel>
    </div>
  )
}

function AudienceTable({ rows }: { rows: AudienceRow[] }) {
  const hasReach = rows.some(r => r.reach !== undefined)
  const hasDelivery = rows.some(r => r.deliveryRate !== undefined)
  const hasViewability = rows.some(r => r.viewability !== undefined)
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: '#f8fafc' }}>
          <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Audience</th>
          {hasReach && <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reach</th>}
          {hasDelivery && <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivery%</th>}
          {hasViewability && <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>View%</th>}
          <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CTR</th>
          <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Conv.</th>
          <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ROI</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '6px 8px', fontWeight: 500 }}>
              {r.name} {r.isLookalike && <span style={{ fontSize: 9.5, background: '#f5f3ff', color: '#7c3aed', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>Lookalike</span>}
            </td>
            {hasReach && <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.reach ? fmt(r.reach) : '—'}</td>}
            {hasDelivery && <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.deliveryRate ?? '—'}%</td>}
            {hasViewability && <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.viewability ?? '—'}%</td>}
            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.ctr}%</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(r.conversions)}</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: r.roi >= 0 ? '#16a34a' : '#dc2626' }}>{r.roi}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CreativeBarAndTable({ rows, color }: { rows: CreativeRow[]; color: string }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9.5, fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 9.5, fill: '#334155' }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Bar dataKey="ctr" name="CTR %" fill={color} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, marginTop: 8 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ padding: '5px 8px', textAlign: 'left', fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Name</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CTR</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Conv.</th>
            <th style={{ padding: '5px 8px', textAlign: 'right', fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '5px 8px' }}>{r.name}{r.format ? <span style={{ color: '#94a3b8' }}> · {r.format}</span> : null}</td>
              <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.ctr}%</td>
              <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(r.conversions)}</td>
              <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{rupee(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function PostClickFunnel({ stages, color }: { stages: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...stages.map(s => s.value))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {stages.map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 110, fontSize: 11.5, color: '#475569', flexShrink: 0 }}>{s.label}</div>
          <div style={{ flex: 1, height: 18, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(3, Math.round((s.value / max) * 100))}%`, background: color, borderRadius: 4 }} />
          </div>
          <div style={{ width: 70, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{fmt(s.value)}</div>
        </div>
      ))}
    </div>
  )
}
