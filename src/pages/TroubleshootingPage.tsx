import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Command } from '../components/Command'
import { troubleshooting } from '../content'
import { useProgress } from '../features/progress'
import { InlineText } from '../lib/InlineText'
import { OS_LABEL } from '../lib/os'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

export function TroubleshootingPage() {
  useDocumentTitle('Vianmääritys')
  const { entryId } = useParams()
  const { progress } = useProgress()
  const [showAll, setShowAll] = useState(false)

  const entries = Object.entries(troubleshooting).filter(
    ([id, e]) => showAll || progress.os === null || e.os.includes(progress.os) || id === entryId,
  )

  useEffect(() => {
    if (entryId) document.getElementById(`vika-${entryId}`)?.scrollIntoView?.({ block: 'start' })
  }, [entryId])

  return (
    <>
      <h1>Vianmääritys</h1>
      <p>
        Jumissa? Se on täysin normaalia, ja jokainen koodaaja törmää näihin. Etsi alta ongelma, joka muistuttaa omaasi. Jos mikään ei auta, voit
        myös kopioida virheilmoituksen Claudelle ja kysyä, mitä se tarkoittaa.
      </p>
      {progress.os !== null && (
        <label className="checkbox">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Näytä myös muiden käyttöjärjestelmien
          ongelmat (nyt näytetään: {OS_LABEL[progress.os]})
        </label>
      )}
      <div className="troubleshooting">
        {entries.map(([id, entry]) => (
          <details key={id} id={`vika-${id}`} className="read-more troubleshooting__entry" open={id === entryId || undefined}>
            <summary className="read-more__summary">
              {entry.title}
              <span className="muted troubleshooting__os"> ({entry.os.map((o) => OS_LABEL[o]).join(', ')})</span>
            </summary>
            <div className="read-more__body">
              <p>
                <strong>Oire:</strong> <InlineText text={entry.symptom} />
              </p>
              <p>
                <strong>Näin korjaat:</strong>
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
    </>
  )
}
