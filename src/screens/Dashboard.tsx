import { useEffect, useState } from 'react'
import type { Screen } from '../types'
import { api } from '../api'

const CH_COLORS: Record<string, string> = {
  Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6',
}

const STATUS_LABEL: Record<string, string> = {
  live: 'Live', draft: 'Draft', paused: 'Paused', at_risk: 'At Risk', ended: 'Ended',
}

interface CampaignRow {
  id: string
  name: string
  business_unit: string
  status: string
  total_budget: number
  spend_mtd: number
  leads: number
  channels: string[]
}

interface Stats {
  activeCampaigns: number
  activeCampaignsDelta: string
  totalSpendMtd: number
  totalSpendMtdNote: string
  leadsToday: number
  leadsTodayDelta: string
  channelsLive: number
  channelsLiveTotal: number
  channelsLiveNote: string
  channelThroughput: Record<string, number>
}

interface Props { onNavigate: (s: Screen) => void }

const fmtRupee = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

export default function Dashboard({ onNavigate }: Props) {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [campaignsRes, statsRes] = await Promise.all([api.listCampaigns(), api.campaignStats()])
        if (cancelled) return
        setCampaigns(campaignsRes.campaigns)
        setStats(statsRes)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1300 }}>
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12.5, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats && (
          <>
            <StatCard label="ACTIVE CAMPAIGNS" icon="◉" value={String(stats.activeCampaigns)} note={stats.activeCampaignsDelta} noteColor="#16a34a" />
            <StatCard label="TOTAL SPEND, MTD" icon="₹" value={fmtRupee(stats.totalSpendMtd)} mono note={stats.totalSpendMtdNote} noteColor="#64748b" />
            <StatCard label="LEADS TODAY" icon="⟶" value={String(stats.leadsToday)} note={stats.leadsTodayDelta} noteColor="#16a34a" />
            <StatCard label="CHANNELS LIVE" icon="✦" value={`${stats.channelsLive} / ${stats.channelsLiveTotal}`} note={stats.channelsLiveNote} noteColor="#16a34a" />
          </>
        )}
        {!stats && loading && [0, 1, 2, 3].map(i => <StatCard key={i} label="—" icon="" value="…" note="" noteColor="#94a3b8" />)}
      </div>

      {/* Channel throughput */}
      {stats && (
        <div style={{
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 28,
        }}>
          <span
            style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}
            title="% of users reached who converted — leads, transactions, or views, depending on what each campaign on that channel optimizes for"
          >
            Channel Throughput
          </span>
          {Object.entries(stats.channelThroughput).map(([name, pct]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: CH_COLORS[name], flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#334155', whiteSpace: 'nowrap' }}>{name}</span>
              <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: CH_COLORS[name], borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>{pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 16px 12px 18px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0f2044' }}>Recent Campaigns</span>
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 10 }}>Last 30 days · {campaigns.length} campaigns</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="ht-select" style={{ width: 130, fontSize: 12 }}>
              <option>All Channels</option>
              <option>Echo</option>
              <option>DSP</option>
              <option>WhatsApp</option>
            </select>
            <select className="ht-select" style={{ width: 120, fontSize: 12 }}>
              <option>All Statuses</option>
              <option>Live</option>
              <option>At Risk</option>
              <option>Draft</option>
            </select>
            <button className="btn-primary" onClick={() => onNavigate('wizard')} style={{ fontSize: 12 }}>
              + New Campaign
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Campaign Name', 'ID', 'Business Unit', 'Channels', 'Status', 'Budget', 'Spend MTD', 'Leads', ''].map(h => (
                <th key={h} style={{
                  padding: '9px 14px', textAlign: 'left',
                  fontSize: 10.5, fontWeight: 700, color: '#64748b',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && campaigns.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '24px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No campaigns yet — create your first one.</td></tr>
            )}
            {campaigns.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < campaigns.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#94a3b8' }}>{c.id}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontSize: 11.5, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                    background: '#f1f5f9', color: '#475569',
                  }}>{c.business_unit}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {(c.channels || []).map(ch => (
                      <span key={ch} title={ch} style={{
                        width: 9, height: 9, borderRadius: '50%', background: CH_COLORS[ch],
                        display: 'inline-block', cursor: 'help',
                      }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={`status-pill status-${c.status.replace('_', '')}`}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#334155' }}>{fmtRupee(c.total_budget)}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: c.spend_mtd ? '#0f172a' : '#94a3b8' }}>
                    {c.spend_mtd ? fmtRupee(c.spend_mtd) : '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: c.leads ? '#0f172a' : '#94a3b8' }}>
                    {c.leads ? c.leads.toLocaleString('en-IN') : '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-secondary" style={{ padding: '3px 9px', fontSize: 11 }}>View</button>
                    <button className="btn-secondary" style={{ padding: '3px 9px', fontSize: 11 }}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, icon, value, note, noteColor, mono }: { label: string; icon: string; value: string; note: string; noteColor: string; mono?: boolean }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 16, color: '#1b3a6b', opacity: 0.5 }}>{icon}</span>
      </div>
      <div style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
        fontSize: 26, fontWeight: 700, color: '#0f2044', lineHeight: 1, marginBottom: 6,
      }}>{value}</div>
      {note && <div style={{ fontSize: 11.5, fontWeight: 600, color: noteColor }}>{note}</div>}
    </div>
  )
}
