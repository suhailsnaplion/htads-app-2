interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header style={{
      height: 52, background: 'white', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0f2044', lineHeight: 1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12, pointerEvents: 'none' }}>⌕</span>
        <input
          type="text"
          placeholder="Search campaigns, IDs..."
          style={{
            padding: '5px 10px 5px 26px', fontSize: 12.5, width: 220,
            border: '1px solid #e2e8f0', borderRadius: 5,
            background: '#f8fafc', color: '#334155', outline: 'none',
          }}
        />
      </div>

      {/* Notifications */}
      <button style={{
        position: 'relative', background: 'none', border: '1px solid #e2e8f0',
        borderRadius: 5, width: 32, height: 32, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: '#64748b',
      }}>
        🔔
        <span style={{
          position: 'absolute', top: 5, right: 5,
          width: 7, height: 7, borderRadius: '50%',
          background: '#dc2626', border: '1.5px solid white',
        }} />
      </button>

      {/* Quick action */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 5,
        fontSize: 11, color: '#64748b',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
        <span>3 Live</span>
        <span style={{ color: '#e2e8f0' }}>|</span>
        <span style={{ color: '#dc2626' }}>1 At Risk</span>
      </div>
    </header>
  )
}
