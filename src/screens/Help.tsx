const ARTICLES = [
  { title: 'Getting started with HT Ads', desc: 'Overview of the platform, navigation, and your first campaign.', tag: 'Quickstart', mins: 3 },
  { title: 'Campaign wizard — step by step', desc: 'Detailed walkthrough of all four wizard steps, field requirements, and validation rules.', tag: 'Campaign Setup', mins: 8 },
  { title: 'Budget allocation and validation rules', desc: 'How the total vs channel budget constraint works, and best practices for multi-channel split.', tag: 'Budgeting', mins: 4 },
  { title: 'HTAuto conditional fields explained', desc: 'When to use the Lead Quality Verification Grid, DRR caps, and model visibility settings.', tag: 'HTAuto', mins: 6 },
  { title: 'WhatsApp templates and variable mapping', desc: 'Selecting templates, filling variable values, and previewing messages before launch.', tag: 'WhatsApp', mins: 5 },
  { title: 'Cohort and audience setup', desc: 'How to create and manage audience segments in the Cohort Registry and use them across channels.', tag: 'Audience', mins: 5 },
]

export default function Help() {
  return (
    <div style={{ padding: '24px 28px', maxWidth: 900 }}>
      {/* Search */}
      <div style={{ background: '#0f2044', borderRadius: 10, padding: '28px 28px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 6 }}>How can we help?</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Search the HT Ads documentation or browse articles below.</p>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14, pointerEvents: 'none' }}>⌕</span>
          <input
            className="ht-input"
            style={{ paddingLeft: 34, fontSize: 13.5, height: 40 }}
            placeholder="Search documentation..."
          />
        </div>
      </div>

      {/* Article cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {ARTICLES.map(a => (
          <div key={a.title} style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1b3a6b'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 2px rgba(27,58,107,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
              <span style={{
                padding: '1px 7px', borderRadius: 3, fontSize: 10, fontWeight: 700,
                background: '#dbeafe', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
              }}>{a.tag}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f2044', marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>{a.desc}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.mins} min read →</div>
          </div>
        ))}
      </div>

      {/* Contact support */}
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '20px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044', marginBottom: 3 }}>Can't find what you're looking for?</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Our support team is available Mon–Fri, 9 AM–7 PM IST.</div>
        </div>
        <button className="btn-primary" style={{ fontSize: 13 }}>Contact Support</button>
      </div>
    </div>
  )
}
