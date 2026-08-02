export type Channel = 'Echo' | 'DSP' | 'WhatsApp' | 'Voice AI' | 'Meta'

const CHANNEL_COLORS: Record<Channel, string> = {
  Echo: '#6366f1',
  DSP: '#0ea5e9',
  WhatsApp: '#22c55e',
  'Voice AI': '#f59e0b',
  Meta: '#8b5cf6',
}

interface ChannelDotProps {
  channel: Channel
  showLabel?: boolean
  size?: number
}

export default function ChannelDot({ channel, showLabel = false, size = 8 }: ChannelDotProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        display: 'inline-block', width: size, height: size, borderRadius: '50%',
        background: CHANNEL_COLORS[channel], flexShrink: 0,
      }} />
      {showLabel && <span style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{channel}</span>}
    </span>
  )
}

export { CHANNEL_COLORS }
