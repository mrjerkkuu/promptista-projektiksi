import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fontit hostataan itse (@fontsource), ei pyyntöjä kolmansille osapuolille.
import '@fontsource-variable/fraunces'
import '@fontsource-variable/figtree'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
