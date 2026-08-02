import { useState } from 'react'
import Step1Config from './Step1Config'
import Step2Channels from './Step2Channels'
import Step3Configure from './Step3Configure'
import Step4Review from './Step4Review'
import LaunchSuccess from './LaunchSuccess'
import { defaultFormData } from '../../types'
import type { CampaignFormData } from '../../types'
import { api } from '../../api'

const STEPS = [
  { n: 1, label: 'Campaign Configuration' },
  { n: 2, label: 'Select Channels' },
  { n: 3, label: 'Configure Channels' },
  { n: 4, label: 'Review & Launch' },
]

interface Props {
  onLaunched: () => void
}

export default function WizardContainer({ onLaunched }: Props) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CampaignFormData>(defaultFormData)
  const [launchedId, setLaunchedId] = useState<string | null>(null)
  const [launchError, setLaunchError] = useState('')

  const patch = (p: Partial<CampaignFormData>) => setForm(f => ({ ...f, ...p }))

  const handleLaunch = async () => {
    setLaunchError('')
    try {
      const { campaign } = await api.createCampaign(form)
      setLaunchedId(campaign.id)
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Could not save the campaign to the server')
    }
  }

  const resetWizard = () => {
    setForm(defaultFormData)
    setLaunchedId(null)
    setLaunchError('')
    setStep(1)
  }

  const canProceed = () => {
    if (step === 2) {
      const total = parseInt(form.totalBudget || '0', 10)
      const alloc = form.selectedChannels.reduce((s, ch) => s + parseInt(form.channelBudgets[ch] || '0', 10), 0)
      if (form.selectedChannels.length === 0) return false
      if (alloc > total && total > 0) return false
    }
    return true
  }

  if (launchedId) {
    return (
      <LaunchSuccess
        data={form}
        campaignId={launchedId}
        onGoToDashboard={() => { onLaunched(); resetWizard() }}
        onCreateAnother={resetWizard}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {launchError && (
        <div style={{ margin: '12px 28px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12.5, color: '#dc2626' }}>
          {launchError}
        </div>
      )}
      {/* Step indicator */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0,
      }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: s.n <= step ? 'pointer' : 'default' }}
              onClick={() => { if (s.n < step) setStep(s.n) }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.n < step ? '#1b3a6b' : s.n === step ? '#1b3a6b' : '#f1f5f9',
                border: s.n === step ? '2px solid #1b3a6b' : s.n < step ? '2px solid #1b3a6b' : '2px solid #e2e8f0',
                fontSize: 11, fontWeight: 700,
                color: s.n <= step ? 'white' : '#94a3b8',
              }}>
                {s.n < step ? '✓' : s.n}
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Step {s.n}</div>
                <div style={{ fontSize: 12.5, fontWeight: s.n === step ? 700 : 500, color: s.n === step ? '#0f2044' : s.n < step ? '#64748b' : '#94a3b8' }}>{s.label}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: s.n < step ? '#1b3a6b' : '#e2e8f0', margin: '0 12px', marginBottom: -12 }} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', paddingBottom: 24 }}>
        {step === 1 && <Step1Config data={form} onChange={patch} />}
        {step === 2 && <Step2Channels data={form} onChange={patch} />}
        {step === 3 && <Step3Configure data={form} onChange={patch} />}
        {step === 4 && <Step4Review data={form} onChange={patch} onLaunch={handleLaunch} onEdit={s => setStep(s)} />}
      </div>

      {/* Footer nav — all steps except step 4 */}
      {step < 4 && (
        <div style={{
          background: step === 2 ? '#0f2044' : 'white',
          borderTop: `1px solid ${step === 2 ? '#1b3a6b' : '#e2e8f0'}`,
          padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {/* Step 2: budget summary inline */}
          {step === 2 ? (() => {
            const totalBudget = parseInt(form.totalBudget || '0', 10)
            const allocated = form.selectedChannels.reduce((s, ch) => s + parseInt((form.channelBudgets[ch] || '0').replace(/,/g, ''), 10), 0)
            const remaining = totalBudget - allocated
            const over = allocated > totalBudget && totalBudget > 0
            const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
            return (
              <>
                {over && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 5, marginRight: 16 }}>
                    ⚠ Allocated exceeds total budget
                  </span>
                )}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  {[
                    { label: 'Total Budget', value: fmt(totalBudget), color: 'rgba(255,255,255,0.65)' },
                    { label: 'Allocated', value: fmt(allocated), color: over ? '#fca5a5' : '#86efac' },
                    { label: 'Remaining', value: fmt(Math.max(0, remaining)), color: remaining < 0 ? '#fca5a5' : 'rgba(255,255,255,0.9)' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
                    {form.selectedChannels.map(ch => {
                      const colors: Record<string, string> = { Echo: '#6366f1', DSP: '#0ea5e9', WhatsApp: '#22c55e', 'Voice AI': '#f59e0b', Meta: '#8b5cf6' }
                      return <span key={ch} style={{ width: 7, height: 7, borderRadius: '50%', background: colors[ch] }} title={ch} />
                    })}
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{form.selectedChannels.length} channel{form.selectedChannels.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                  <button
                    style={{
                      padding: '7px 16px', borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                    onClick={() => setStep(s => s - 1)}
                  >
                    ← Back
                  </button>
                  <button
                    style={{
                      padding: '7px 16px', borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: canProceed() ? 'pointer' : 'not-allowed',
                      background: canProceed() ? '#dc2626' : 'rgba(255,255,255,0.1)',
                      color: canProceed() ? 'white' : 'rgba(255,255,255,0.4)',
                      border: 'none', opacity: canProceed() ? 1 : 0.7,
                    }}
                    onClick={() => { if (canProceed()) setStep(s => s + 1) }}
                    disabled={!canProceed()}
                  >
                    Configure Channels →
                  </button>
                </div>
              </>
            )
          })() : (
            <>
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{ opacity: step === 1 ? 0.4 : 1 }}>
                ← Back
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                {STEPS.map(s => (
                  <div key={s.n} style={{
                    width: s.n === step ? 20 : 6, height: 6, borderRadius: 3,
                    background: s.n <= step ? '#1b3a6b' : '#e2e8f0',
                    transition: 'all 0.2s',
                  }} />
                ))}
              </div>
              <button
                className="btn-primary"
                onClick={() => { if (canProceed()) setStep(s => s + 1) }}
                disabled={!canProceed()}
                style={{ opacity: canProceed() ? 1 : 0.5 }}
              >
                {step === 3 ? 'Review & Launch →' : 'Next Step →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
