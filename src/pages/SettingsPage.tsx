import { useId, useRef, useState } from 'react'
import { OsPicker } from '../components/OsPicker'
import { ThemeSelect } from '../components/ThemeSelect'
import { exportCode, exportFileContent, importProgress, useProgress } from '../features/progress'
import { copyText } from '../lib/clipboard'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

export function SettingsPage() {
  useDocumentTitle('Asetukset')
  return (
    <>
      <h1>Asetukset</h1>
      <section aria-labelledby="ulkoasu-otsikko">
        <h2 id="ulkoasu-otsikko">Käyttöjärjestelmä ja ulkoasu</h2>
        <OsPicker />
        <ThemeSelect />
      </section>
      <TransferSection />
      <ResetSection />
    </>
  )
}

function TransferSection() {
  const { progress, dispatch } = useProgress()
  const [code, setCode] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const exportId = useId()
  const importId = useId()
  const fileId = useId()

  function download() {
    const blob = new Blob([exportFileContent(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'promptista-projektiksi-edistyminen.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function runImport(text: string) {
    try {
      dispatch({ type: 'replace', progress: importProgress(text) })
      setImportStatus({ ok: true, message: 'Edistyminen tuotu! Olet nyt samassa kohdassa kuin toisella laitteella.' })
      setImportText('')
    } catch {
      setImportStatus({ ok: false, message: 'Koodia ei voitu lukea. Tarkista, että kopioit koko koodin, ja yritä uudelleen.' })
    }
  }

  return (
    <section aria-labelledby="siirto-otsikko">
      <h2 id="siirto-otsikko">Siirrä edistyminen toiselle laitteelle</h2>
      <p>Edistymisesi on tallessa vain tässä selaimessa. Jos haluat jatkaa toisella laitteella tai toisessa selaimessa, siirrä se koodilla tai tiedostolla.</p>

      <h3>1. Vie tältä laitteelta</h3>
      <div className="button-row">
        <button type="button" className="button" onClick={() => setCode(exportCode(progress))}>
          Näytä siirtokoodi
        </button>
        <button type="button" className="button button--secondary" onClick={download}>
          Lataa tiedostona
        </button>
      </div>
      {code !== null && (
        <div className="stack">
          <label htmlFor={exportId}>Siirtokoodi (kopioi tämä kokonaan):</label>
          <textarea id={exportId} readOnly rows={4} value={code} onFocus={(e) => e.currentTarget.select()} />
          <button
            type="button"
            className="button button--secondary"
            onClick={async () => setCopyStatus((await copyText(code)) ? 'Koodi kopioitu!' : 'Kopiointi ei onnistunut. Valitse koodi ja kopioi se itse.')}
          >
            Kopioi koodi
          </button>
          <p aria-live="polite">{copyStatus}</p>
        </div>
      )}

      <h3>2. Tuo toisella laitteella</h3>
      <p className="muted">Huom! Tuonti korvaa tällä laitteella olevan edistymisen.</p>
      <div className="stack">
        <label htmlFor={importId}>Liitä siirtokoodi:</label>
        <textarea id={importId} rows={4} value={importText} onChange={(e) => setImportText(e.target.value)} />
        <button type="button" className="button" disabled={importText.trim() === ''} onClick={() => runImport(importText)}>
          Tuo koodista
        </button>
        <div>
          <label htmlFor={fileId}>Tai valitse ladattu tiedosto: </label>
          <input
            id={fileId}
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) runImport(await file.text())
              e.target.value = ''
            }}
          />
        </div>
      </div>
      <div aria-live="polite">
        {importStatus && <p className={`notice ${importStatus.ok ? 'notice--success' : 'notice--error'}`}>{importStatus.message}</p>}
      </div>
    </section>
  )
}

function ResetSection() {
  const { dispatch } = useProgress()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <section aria-labelledby="nollaus-otsikko">
      <h2 id="nollaus-otsikko">Aloita alusta</h2>
      <p>Poistaa kaiken edistymisesi tästä selaimesta: luetut aiheet, visavastaukset, merkit ja harjoitukset. Teemavalinta säilyy.</p>
      {!confirming ? (
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setConfirming(true)
            setDone(false)
            requestAnimationFrame(() => cancelRef.current?.focus())
          }}
        >
          Aloita alusta…
        </button>
      ) : (
        <div className="notice notice--warning" role="alertdialog" aria-labelledby="nollaus-varmistus">
          <p id="nollaus-varmistus">
            <strong>Haluatko varmasti poistaa kaiken edistymisesi?</strong> Tätä ei voi perua.
          </p>
          <div className="button-row">
            <button
              type="button"
              className="button button--danger"
              onClick={() => {
                dispatch({ type: 'reset' })
                setConfirming(false)
                setDone(true)
              }}
            >
              Kyllä, aloita alusta
            </button>
            <button type="button" className="button button--secondary" ref={cancelRef} onClick={() => setConfirming(false)}>
              Peruuta
            </button>
          </div>
        </div>
      )}
      <div aria-live="polite">{done && <p className="notice notice--success">Edistyminen nollattu. Tervetuloa uudelleen alkuun!</p>}</div>
    </section>
  )
}
