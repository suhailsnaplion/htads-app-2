interface BadgeProps {
  type: 'mandatory' | 'optional' | 'conditional'
  condition?: string
}

// Mandatory -> small red asterisk. Optional -> nothing (absence is the signal).
// Conditional -> small muted dagger with the condition in a native tooltip.
export default function Badge({ type, condition }: BadgeProps) {
  if (type === 'optional') return null

  if (type === 'mandatory') {
    return (
      <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, lineHeight: 1 }} title="Required">
        *
      </span>
    )
  }

  return (
    <span style={{ color: '#b45309', fontSize: 12, fontWeight: 700, cursor: 'help', lineHeight: 1 }} title={condition || 'Shown conditionally'}>
      †
    </span>
  )
}
