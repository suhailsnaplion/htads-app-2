const USERS = [
  { name: 'Priya Kapoor', email: 'priya.kapoor@hindustantimes.com', role: 'Campaign Manager', lastActive: '2 minutes ago', status: 'Active' },
  { name: 'Ravi Sharma', email: 'ravi.sharma@hindustantimes.com', role: 'Campaign Manager', lastActive: '1 hour ago', status: 'Active' },
  { name: 'Meena Iyer', email: 'meena.iyer@hindustantimes.com', role: 'Campaign Manager', lastActive: '3 hours ago', status: 'Active' },
  { name: 'Sunita Rao', email: 'sunita.rao@hindustantimes.com', role: 'Campaign Manager', lastActive: 'Yesterday', status: 'Active' },
  { name: 'Arun Pillai', email: 'arun.pillai@hindustantimes.com', role: 'Admin', lastActive: '2 days ago', status: 'Active' },
  { name: 'Deepak Nair', email: 'deepak.nair@hindustantimes.com', role: 'Read Only', lastActive: '5 days ago', status: 'Inactive' },
  { name: 'Kavitha Menon', email: 'kavitha.menon@hindustantimes.com', role: 'Campaign Manager', lastActive: '1 week ago', status: 'Invited' },
]

export default function UserAdmin() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0f2044' }}>User & Permissions</span>
            <span style={{ fontSize: 11.5, color: '#94a3b8', marginLeft: 8 }}>7 users</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="ht-select" style={{ width: 130, fontSize: 12 }}>
              <option>All Roles</option>
              <option>Admin</option>
              <option>Campaign Manager</option>
              <option>Read Only</option>
            </select>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Invite User</button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Name', 'Email', 'Role', 'Last Active', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.email} style={{ borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
              >
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: `hsl(${u.name.charCodeAt(0) * 7 % 360}, 50%, 60%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'white',
                    }}>{u.name.split(' ').map(p => p[0]).join('')}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12.5, color: '#64748b' }}>{u.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11.5, fontWeight: 600,
                    background: u.role === 'Admin' ? '#dbeafe' : u.role === 'Read Only' ? '#f1f5f9' : '#ede9fe',
                    color: u.role === 'Admin' ? '#1e40af' : u.role === 'Read Only' ? '#64748b' : '#5b21b6',
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#94a3b8' }}>{u.lastActive}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: u.status === 'Active' ? '#dcfce7' : u.status === 'Invited' ? '#fef3c7' : '#fee2e2',
                    color: u.status === 'Active' ? '#15803d' : u.status === 'Invited' ? '#d97706' : '#dc2626',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: '3px 9px' }}>Edit</button>
                    {u.status !== 'Inactive' && (
                      <button className="btn-secondary" style={{ fontSize: 11, padding: '3px 9px', color: '#dc2626' }}>Disable</button>
                    )}
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
