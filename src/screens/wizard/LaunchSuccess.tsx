import type { CampaignFormData } from '../../types'

interface Props {
  data: CampaignFormData
  campaignId: string
  onGoToDashboard: () => void
  onCreateAnother: () => void
}

export default function LaunchSuccess({ data, campaignId, onGoToDashboard, onCreateAnother }: Props) {
  const channelColors: Record<string, string> = { Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6' }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', background: 'radial-gradient(120% 100% at 50% 0%, #f0f5fb 0%, #f1f5f9 60%)',
    }}>
      <div style={{
        width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        boxShadow: '0 12px 32px rgba(22,163,74,0.35)',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#0f2044', marginBottom: 8, textAlign: 'center' }}>
        Campaign launched successfully!
      </div>
      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28, textAlign: 'center', maxWidth: 440 }}>
        <strong style={{ color: '#334155' }}>{data.campaignName}</strong> is now live across {data.selectedChannels.length} channel{data.selectedChannels.length !== 1 ? 's' : ''}. Tracking and lead delivery start immediately.
      </div>

      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 28px',
        display: 'flex', gap: 32, marginBottom: 32, boxShadow: '0 4px 16px rgba(15,32,68,0.06)',
      }}>
        <div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>Campaign ID</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: '#0f2044' }}>{campaignId}</div>
        </div>
        <div style={{ width: 1, background: '#e2e8f0' }} />
        <div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>Business Unit</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f2044' }}>{data.businessUnit}</div>
        </div>
        <div style={{ width: 1, background: '#e2e8f0' }} />
        <div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>Channels</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 2 }}>
            {data.selectedChannels.map(ch => (
              <span key={ch} style={{ width: 9, height: 9, borderRadius: '50%', background: channelColors[ch] }} title={ch} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onCreateAnother}>+ Create Another Campaign</button>
        <button className="btn-primary" onClick={onGoToDashboard}>Go to Dashboard →</button>
      </div>
    </div>
  )
}
