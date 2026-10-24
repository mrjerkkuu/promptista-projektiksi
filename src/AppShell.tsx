import { Route, Routes } from 'react-router'
import { BadgeToaster } from './components/BadgeToaster'
import { ThemeSync } from './components/ThemeSelect'
import { deriveBadges } from './features/badges'
import { ProgressProvider } from './features/progress'
import { Layout } from './layout/Layout'
import { BadgesPage } from './pages/BadgesPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { HomePage } from './pages/HomePage'
import { ModulePage } from './pages/ModulePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PathPage } from './pages/PathPage'
import { SettingsPage } from './pages/SettingsPage'
import { TroubleshootingPage } from './pages/TroubleshootingPage'

/** Sovellus ilman reititintä (testit käyttävät MemoryRouteria). */
export function AppShell() {
  return (
    <ProgressProvider derive={deriveBadges}>
      <ThemeSync />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/polku/:pathId" element={<PathPage />} />
          <Route path="/polku/:pathId/:moduleId" element={<ModulePage />} />
          <Route path="/sanasto/:termId?" element={<GlossaryPage />} />
          <Route path="/vianmaaritys/:entryId?" element={<TroubleshootingPage />} />
          <Route path="/merkit" element={<BadgesPage />} />
          <Route path="/asetukset" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <BadgeToaster />
    </ProgressProvider>
  )
}
