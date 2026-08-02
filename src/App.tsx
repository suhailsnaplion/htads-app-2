import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './screens/Dashboard'
import WizardContainer from './screens/wizard/WizardContainer'
import AdvancedSettings from './screens/AdvancedSettings'
import UserAdmin from './screens/UserAdmin'
import Help from './screens/Help'
import IntelligencePanel from './screens/IntelligencePanel'
import type { Screen } from './types'

const PAGE_TITLES: Record<Screen, { title: string; subtitle?: string }> = {
  login: { title: 'HT Ads' },
  dashboard: { title: 'Dashboard', subtitle: 'Campaign overview · Aug 2026' },
  wizard: { title: 'New Campaign', subtitle: 'Multi-channel campaign wizard' },
  advanced: { title: 'Advanced Settings', subtitle: 'Registries and configuration' },
  admin: { title: 'User Admin', subtitle: 'Roles and permissions' },
  help: { title: 'Help & Documentation' },
  intelligence: { title: 'Campaign Intelligence', subtitle: 'Insights & recommended actions' },
}

// Login has been removed for this deployment — the app opens straight to
// the dashboard. The backend no longer requires a session token either
// (see server/src/middleware/auth.js).
export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

  const handleLaunched = () => {
    setRefreshKey(k => k + 1) // forces Dashboard to refetch campaigns
    setScreen('dashboard')
  }

  const openIntelligence = (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    setScreen('intelligence')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentScreen={screen} onNavigate={setScreen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar {...PAGE_TITLES[screen]} />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {screen === 'dashboard' && <Dashboard onNavigate={setScreen} onOpenIntelligence={openIntelligence} key={refreshKey} />}
          {screen === 'wizard' && <WizardContainer onLaunched={handleLaunched} />}
          {screen === 'advanced' && <AdvancedSettings />}
          {screen === 'admin' && <UserAdmin />}
          {screen === 'help' && <Help />}
          {screen === 'intelligence' && <IntelligencePanel campaignId={selectedCampaignId} onBack={() => setScreen('dashboard')} />}
        </div>
      </div>
    </div>
  )
}
