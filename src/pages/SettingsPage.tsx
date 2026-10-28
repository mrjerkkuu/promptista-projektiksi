import { useId, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { LanguageSelect } from '../components/LanguageSelect'
import { Nuppu } from '../components/Nuppu'
import { OsPicker } from '../components/OsPicker'
import { ThemeSelect } from '../components/ThemeSelect'
import { exportCode, exportFileContent, importProgress, useProgress } from '../features/progress'
import { useT } from '../i18n'
import { copyText } from '../lib/clipboard'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

export function SettingsPage() {
  const t = useT()
  useDocumentTitle(t.settings.title)
  return (
    <div className="reading">
      <h1>{t.settings.title}</h1>
      <section aria-labelledby="ulkoasu-otsikko" className="card settings-section">
        <h2 id="ulkoasu-otsikko">{t.settings.appearance}</h2>
        <LanguageSelect />
        <OsPicker />
        <ThemeSelect />
      </section>
      <TransferSection />
      <ResetSection />
    </div>
  )
}

function TransferSection() {
  const { progress, dispatch } = useProgress()
  const { settings: t } = useT()
  const [code, setCode] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const exportId = useId()
  const importId = useId()
  const fileId = useId()
  const fileStatusId = useId()

  function download() {
    const blob = new Blob([exportFileContent(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = t.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  function runImport(text: string) {
    try {
      dispatch({ type: 'replace', progress: importProgress(text) })
      setImportStatus({ ok: true, message: t.importOk })
      setImportText('')
    } catch {
      setImportStatus({ ok: false, message: t.importFailed })
    }
  }

  return (
    <section aria-labelledby="siirto-otsikko" className="card settings-section">
      <h2 id="siirto-otsikko">{t.transferHeading}</h2>
      <p className="muted">{t.transferIntro}</p>

      <div className="settings-panel">
        <h3>
          <span className="settings-panel__number mono">1.</span> {t.exportHeading}
        </h3>
        <div className="button-row">
          <button type="button" className="button" onClick={() => setCode(exportCode(progress))}>
            {t.showCode}
          </button>
          <button type="button" className="button button--secondary" onClick={download}>
            <Icon name="download" />
            {t.download}
          </button>
        </div>
        {code !== null && (
          <div className="stack settings-panel__reveal">
            <label htmlFor={exportId}>{t.codeLabel}</label>
            <textarea id={exportId} readOnly rows={4} value={code} onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              className="button button--secondary button--small"
              onClick={async () => setCopyStatus((await copyText(code)) ? t.codeCopied : t.codeCopyFailed)}
            >
              {t.copyCode}
            </button>
            <p aria-live="polite" className="settings-panel__status">
              {copyStatus}
            </p>
          </div>
        )}
      </div>

      <div className="settings-panel">
        <h3>
          <span className="settings-panel__number mono">2.</span> {t.importHeading}
        </h3>
        <p className="muted settings-panel__warning">
          <Icon name="warning" />
          {t.importWarning}
        </p>
        <div className="stack">
          <label htmlFor={importId}>{t.pasteLabel}</label>
          <textarea id={importId} rows={4} value={importText} onChange={(e) => setImportText(e.target.value)} />
          <button type="button" className="button" disabled={importText.trim() === ''} onClick={() => runImport(importText)}>
            {t.importButton}
          </button>
          {/* Natiivi tiedostovalitsin piilotetaan näkyvistä; sen label näytetään painikkeena. */}
          <div className="file-picker">
            <span>{t.orFile}</span>
            <input
              id={fileId}
              type="file"
              className="visually-hidden"
              accept="application/json,.json"
              aria-describedby={fileStatusId}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) runImport(await file.text())
                e.target.value = ''
              }}
            />
            <label htmlFor={fileId} className="button button--secondary button--small">
              {t.chooseFile}
            </label>
            <span id={fileStatusId} className="muted file-picker__status">
              {t.noFile}
            </span>
          </div>
        </div>
        <div aria-live="polite">
          {importStatus && (
            <p className={`notice notice--rise ${importStatus.ok ? 'notice--success' : 'notice--error'}`}>{importStatus.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}

function ResetSection() {
  const { dispatch } = useProgress()
  const { settings: t } = useT()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <section aria-labelledby="nollaus-otsikko" className="card settings-section">
      <h2 id="nollaus-otsikko">{t.resetHeading}</h2>
      <p className="muted">{t.resetIntro}</p>
      {!confirming ? (
        <button
          type="button"
          className="button button--danger-outline"
          onClick={() => {
            setConfirming(true)
            setDone(false)
            requestAnimationFrame(() => cancelRef.current?.focus())
          }}
        >
          {t.resetButton}
        </button>
      ) : (
        <div className="notice notice--warning notice--mascot notice--rise reset-confirm" role="alertdialog" aria-labelledby="nollaus-varmistus">
          <Nuppu pose="miettii" size={64} />
          <p id="nollaus-varmistus" className="reset-confirm__text">
            <strong>{t.resetConfirm}</strong> {t.resetCannotUndo}
          </p>
          <div className="button-row reset-confirm__actions">
            <button
              type="button"
              className="button button--danger button--small"
              onClick={() => {
                dispatch({ type: 'reset' })
                setConfirming(false)
                setDone(true)
              }}
            >
              {t.resetYes}
            </button>
            <button type="button" className="button button--secondary button--small" ref={cancelRef} onClick={() => setConfirming(false)}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
      <div aria-live="polite">{done && <p className="notice notice--success notice--rise">{t.resetDone}</p>}</div>
    </section>
  )
}
