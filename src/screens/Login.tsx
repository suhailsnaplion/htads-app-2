import { useState } from 'react'
import { api, setToken } from '../api'

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('priya.kapoor@hindustantimes.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const { token } = await api.login(email, password)
      setToken(token)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Left — dark brand panel */}
      <div style={{
        width: '42%', background: '#0f2044',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric background accent */}
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(41,82,163,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo mark */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #2952a3 0%, #dc2626 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)',
              boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
            }}>H</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
              color: 'white', letterSpacing: 0.5,
            }}>HT Ads</span>
          </div>
          <div style={{
            width: 40, height: 3, borderRadius: 2,
            background: 'linear-gradient(90deg, #dc2626, #2952a3)',
          }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: 'white', lineHeight: 1.25, marginBottom: 14,
        }}>
          One platform for every<br />acquisition channel.
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 40, maxWidth: 340 }}>
          Plan, configure, and launch campaigns across Echo, DSP, WhatsApp, Voice AI, and Meta — from a single ops console.
        </p>

        {/* Channel chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { name: 'Echo', color: '#6366f1' },
            { name: 'DSP', color: '#0ea5e9' },
            { name: 'WhatsApp', color: '#22c55e' },
            { name: 'Voice AI', color: '#f59e0b' },
            { name: 'Meta', color: '#8b5cf6' },
          ].map(ch => (
            <div key={ch.name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              border: `1px solid ${ch.color}40`,
              background: `${ch.color}15`,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: ch.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{ch.name}</span>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div style={{
          marginTop: 60, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', gap: 36,
        }}>
          {[{ label: 'Active Campaigns', value: '47' }, { label: 'BUs Onboarded', value: '8' }, { label: 'Channels', value: '5' }].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div style={{
        flex: 1, background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
      }}>
        <div style={{
          background: 'white', borderRadius: 12,
          border: '1px solid #e2e8f0', padding: '40px 36px',
          width: '100%', maxWidth: 400,
          boxShadow: '0 4px 32px rgba(15,32,68,0.06)',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
              color: '#0f2044', marginBottom: 6,
            }}>Sign in</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>Access your HT Ads campaign console.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>Work email</label>
            <input
              className="ht-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@hindustantimes.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>Password</label>
            <input
              className="ht-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12.5, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 14, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="#" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none' }}>Contact IT admin for access issues</a>
          </div>

          <div style={{
            marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>All systems operational · SSO available via Google Workspace</span>
          </div>
        </div>
      </div>
    </div>
  )
}
