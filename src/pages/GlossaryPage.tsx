import { useEffect } from 'react'
import { useParams } from 'react-router'
import { Nuppu } from '../components/Nuppu'
import { glossary } from '../content'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import './pages.css'

const entries = Object.entries(glossary).sort(([, a], [, b]) => a.term.localeCompare(b.term, 'fi'))

export function GlossaryPage() {
  useDocumentTitle('Sanasto')
  const { termId } = useParams()

  useEffect(() => {
    if (termId) document.getElementById(`termi-${termId}`)?.scrollIntoView?.({ block: 'center' })
  }, [termId])

  return (
    <>
      <header className="page-header">
        <div className="page-header__text">
          <h1>Sanasto</h1>
          <p>Kaikki sivuston termit lyhyesti. Tekstissä alleviivattua sanaa napauttamalla näet saman selityksen.</p>
        </div>
        <Nuppu pose="osoittaa" size={110} />
      </header>
      <dl className="glossary">
        {entries.map(([id, entry]) => (
          <div key={id} id={`termi-${id}`} className={`glossary__entry${id === termId ? ' glossary__entry--active' : ''}`}>
            <dt className="glossary__term">{entry.term}</dt>
            <dd className="glossary__definition">
              {entry.definition}
              {entry.readMore && (
                <>
                  {' '}
                  <a href={entry.readMore} target="_blank" rel="noreferrer">
                    Lue lisää<span className="visually-hidden"> termistä {entry.term}</span>
                  </a>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
