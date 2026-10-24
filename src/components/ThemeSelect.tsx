import { useEffect, useId } from 'react'
import { themeSchema, useProgress, type Theme } from '../features/progress'

const THEME_LABEL: Record<Theme, string> = {
  system: 'Laitteen mukaan',
  light: 'Vaalea',
  dark: 'Tumma',
}

/** Vaalean ja tumman teeman valinta. "Laitteen mukaan" seuraa prefers-color-scheme-asetusta. */
export function ThemeSelect() {
  const { progress, dispatch } = useProgress()
  const id = useId()
  return (
    <div className="theme-select">
      <label htmlFor={id}>Teema </label>
      <select id={id} value={progress.theme} onChange={(e) => dispatch({ type: 'setTheme', theme: themeSchema.parse(e.target.value) })}>
        {themeSchema.options.map((t) => (
          <option key={t} value={t}>
            {THEME_LABEL[t]}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Vie teemavalinnan <html data-theme>-attribuuttiin, jota tokens.css käyttää. */
export function ThemeSync() {
  const { progress } = useProgress()
  useEffect(() => {
    const root = document.documentElement
    if (progress.theme === 'system') delete root.dataset.theme
    else root.dataset.theme = progress.theme
  }, [progress.theme])
  return null
}
