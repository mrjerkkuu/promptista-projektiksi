import { useEffect, useId } from 'react'
import { themeSchema, useProgress } from '../features/progress'
import { useT } from '../i18n'

/** Vaalean ja tumman teeman valinta. "Laitteen mukaan" seuraa prefers-color-scheme-asetusta. */
export function ThemeSelect() {
  const { progress, dispatch } = useProgress()
  const id = useId()
  const t = useT()
  return (
    <div className="theme-select">
      <label htmlFor={id}>{t.theme.label} </label>
      <span className="select">
        <select id={id} value={progress.theme} onChange={(e) => dispatch({ type: 'setTheme', theme: themeSchema.parse(e.target.value) })}>
          {themeSchema.options.map((option) => (
            <option key={option} value={option}>
              {t.theme.options[option]}
            </option>
          ))}
        </select>
      </span>
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
