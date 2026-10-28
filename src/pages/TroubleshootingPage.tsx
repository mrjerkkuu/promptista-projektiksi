import { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Command } from '../components/Command'
import { Nuppu } from '../components/Nuppu'
import { useProgress } from '../features/progress'
import { useContent, useT } from '../i18n'
import { InlineText } from '../lib/InlineText'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import type { TroubleshootingEntry } from '../schemas/content'
import './pages.css'

export function TroubleshootingPage() {
  const t = useT()
  const { pathsActiveFirst, troubleshooting } = useContent()
  useDocumentTitle(t.troubleshooting.title)
  const { entryId } = useParams()
  const { progress } = useProgress()
  const [showAll, setShowAll] = useState(false)

  const entries = Object.entries(troubleshooting).filter(
    ([id, e]) => showAll || progress.os === null || e.os.includes(progress.os) || id === entryId,
  )
  // Ryhmät: jokaisen polun ongelmat (valittu polku ensin) ja lopuksi kaikkia polkuja koskevat.
  const groups: { key: string; title: string; items: [string, TroubleshootingEntry][] }[] = [
    ...pathsActiveFirst(progress.activePath).map((p) => ({ key: p.id, title: p.title, items: entries.filter(([, e]) => e.path === p.id) })),
    { key: 'yleiset', title: t.troubleshooting.allPaths, items: entries.filter(([, e]) => e.path === undefined) },
  ].filter((g) => g.items.length > 0)

  useEffect(() => {
    if (entryId) document.getElementById(`vika-${entryId}`)?.scrollIntoView?.({ block: 'start' })
  }, [entryId])

  return (
    <div className="reading">
      <header className="page-header">
        <div className="page-header__text">
          <h1>{t.troubleshooting.title}</h1>
          <p>{t.troubleshooting.intro}</p>
        </div>
        <Nuppu pose="miettii" size={100} />
      </header>
      {progress.os !== null && (
        <label className="checkbox">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> {t.troubleshooting.showAll(OS_LABEL[progress.os])}
        </label>
      )}
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`viat-${g.key}`}>
          <h2 id={`viat-${g.key}`}>{g.title}</h2>
          <div className="troubleshooting">
            {g.items.map(([id, entry]) => (
              <details
                key={id}
                id={`vika-${id}`}
                className={`read-more troubleshooting__entry${id === entryId ? ' troubleshooting__entry--active' : ''}`}
                open={id === entryId || undefined}
              >
                <summary className="read-more__summary">
                  <span className="troubleshooting__heading">
                    <span className="troubleshooting__title">{entry.title}</span>
                    {/* Käyttöjärjestelmät chippeinä; ruudunlukija kuulee saman kuin ennen: ”(Windows, Mac)”. */}
                    <span className="troubleshooting__os">
                      <span className="visually-hidden"> (</span>
                      {entry.os.map((o, i) => (
                        <Fragment key={o}>
                          {i > 0 && <span className="visually-hidden">, </span>}
                          <span className="chip troubleshooting__chip">{OS_LABEL[o]}</span>
                        </Fragment>
                      ))}
                      <span className="visually-hidden">)</span>
                    </span>
                  </span>
                </summary>
                <div className="read-more__body">
                  <p>
                    <strong>{t.troubleshooting.symptom}</strong> <InlineText text={entry.symptom} />
                  </p>
                  <p>
                    <strong>{t.troubleshooting.fix}</strong>
                  </p>
                  <ol>
                    {entry.steps.map((step, i) => (
                      <li key={i}>
                        <InlineText text={step} />
                      </li>
                    ))}
                  </ol>
                  {entry.commands?.map((c) => (
                    <Command key={c} id={c} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
