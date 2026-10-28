import { Route, Routes } from 'react-router'
import { BadgeToaster } from './components/BadgeToaster'
import { LanguageRoute, LanguageSync } from './components/LanguageSelect'
import { ThemeSync } from './components/ThemeSelect'
import { deriveBadges } from './features/badges'
import { ProgressProvider } from './features/progress'
import { LANGUAGES } from './i18n'
import { Layout } from './layout/Layout'
import { BadgesPage } from './pages/BadgesPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { HomePage } from './pages/HomePage'
import { ModulePage } from './pages/ModulePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PathPage } from './pages/PathPage'
import { PathsPage } from './pages/PathsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TroubleshootingPage } from './pages/TroubleshootingPage'

/** Sovellus ilman reititintä (testit käyttävät MemoryRouteria). */
export function AppShell() {
  return (
    <ProgressProvider derive={deriveBadges}>
      <ThemeSync />
      <LanguageSync />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/polut" element={<PathsPage />} />
          <Route path="/polku/:pathId" element={<PathPage />} />
          <Route path="/polku/:pathId/:moduleId" element={<ModulePage />} />
          <Route path="/sanasto/:termId?" element={<GlossaryPage />} />
          <Route path="/vianmaaritys/:entryId?" element={<TroubleshootingPage />} />
          <Route path="/merkit" element={<BadgesPage />} />
          <Route path="/asetukset" element={<SettingsPage />} />
          <Route path="/palaute" element={<FeedbackPage />} />
          {/* Jaettavat kielilinkit: #/en ja #/fi. */}
          {LANGUAGES.map((l) => (
            <Route key={l} path={`/${l}`} element={<LanguageRoute language={l} />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <BadgeToaster />
    </ProgressProvider>
  )
}
