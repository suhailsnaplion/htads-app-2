interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <span className="ht-toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="ht-toggle-track" />
        <span className="ht-toggle-thumb" />
      </span>
      {label && <span style={{ fontSize: 12.5, color: checked ? '#1b3a6b' : '#64748b', fontWeight: 500 }}>{checked ? 'On' : 'Off'}{label ? ` — ${label}` : ''}</span>}
    </label>
  )
}
