import type { Screen } from '../types'

interface SidebarProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  onLogout?: () => void
}

const NAV_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'wizard', label: 'New Campaign', icon: '+' },
  { id: 'advanced', label: 'Advanced Settings', icon: '⚙' },
  { id: 'admin', label: 'User Admin', icon: '👤' },
  { id: 'help', label: 'Help', icon: '?' },
]

export default function Sidebar({ currentScreen, onNavigate, onLogout }: SidebarProps) {
  const active = currentScreen === 'wizard' ? 'wizard' : currentScreen

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#0f2044',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: 'linear-gradient(135deg, #2952a3, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)',
          }}>H</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: 0.5 }}>HT Ads</div>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3, textTransform: 'uppercase' }}>Ad Operations</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 4px' }}>Navigation</div>
        {NAV_ITEMS.map(item => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 10px', borderRadius: 6,
                background: isActive ? 'rgba(41,82,163,0.5)' : 'transparent',
                border: isActive ? '1px solid rgba(59,111,196,0.4)' : '1px solid transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', marginBottom: 1, textAlign: 'left',
                transition: 'all 0.15s',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? '#2952a3' : 'rgba(255,255,255,0.07)',
                fontSize: item.id === 'wizard' ? 16 : 13,
                fontWeight: 700, color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                flexShrink: 0,
              }}>
                {item.icon}
              </span>
              {item.label}
              {item.id === 'wizard' && (
                <span style={{
                  marginLeft: 'auto', background: '#dc2626', color: 'white',
                  fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8,
                }}>NEW</span>
              )}
            </button>
          )
        })}

        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px 6px' }}>Channels</div>
          {[
            { name: 'Echo', color: '#6366f1' },
            { name: 'DSP', color: '#0ea5e9' },
            { name: 'WhatsApp', color: '#22c55e' },
            { name: 'Voice AI', color: '#f59e0b' },
            { name: 'Meta', color: '#8b5cf6' },
          ].map(ch => (
            <div key={ch.name} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: ch.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{ch.name}</span>
              <span style={{ marginLeft: 'auto', width: 16, height: 7, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }} />
            </div>
          ))}
        </div>
      </nav>

      {/* User profile */}
      <div style={{
        padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #2952a3, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'white',
        }}>PK</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Priya Kapoor</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>Campaign Manager</div>
        </div>
        <button onClick={onLogout} title="Sign out" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}>⋮</button>
      </div>
    </aside>
  )
}
