import { HashRouter } from 'react-router'
import { AppShell } from './AppShell'

/** HashRouter: GitHub Pages ei tue SPA-reitityksen fallbackia (SUUNNITELMA.md luku 3). */
export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
