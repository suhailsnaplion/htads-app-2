import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import WizardContainer from './screens/wizard/WizardContainer'
import AdvancedSettings from './screens/AdvancedSettings'
import UserAdmin from './screens/UserAdmin'
import Help from './screens/Help'
import type { Screen } from './types'
import { getToken, clearToken } from './api'

const PAGE_TITLES: Record<Screen, { title: string; subtitle?: string }> = {
  login: { title: 'HT Ads' },
  dashboard: { title: 'Dashboard', subtitle: 'Campaign overview · Aug 2026' },
  wizard: { title: 'New Campaign', subtitle: 'Multi-channel campaign wizard' },
  advanced: { title: 'Advanced Settings', subtitle: 'Registries and configuration' },
  admin: { title: 'User Admin', subtitle: 'Roles and permissions' },
  help: { title: 'Help & Documentation' },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(getToken() ? 'dashboard' : 'login')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLogin = () => setScreen('dashboard')
  const handleLogout = () => { clearToken(); setScreen('login') }
  const handleLaunched = () => {
    setRefreshKey(k => k + 1) // forces Dashboard to refetch campaigns
    setScreen('dashboard')
  }

  if (screen === 'login') {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentScreen={screen} onNavigate={setScreen} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar {...PAGE_TITLES[screen]} />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {screen === 'dashboard' && <Dashboard onNavigate={setScreen} key={refreshKey} />}
          {screen === 'wizard' && <WizardContainer onLaunched={handleLaunched} />}
          {screen === 'advanced' && <AdvancedSettings />}
          {screen === 'admin' && <UserAdmin />}
          {screen === 'help' && <Help />}
        </div>
      </div>
    </div>
  )
}
