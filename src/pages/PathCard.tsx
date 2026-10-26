import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { ProgressBar } from '../components/ProgressBar'
import '../components/StatusLabel.css'
import type { LearningPath } from '../content'
import { countProgress, useProgress } from '../features/progress'
import './pages.css'

interface PathCardProps {
  path: LearningPath
  /** Otsikkotaso sivun rakenteen mukaan: etusivulla kortit ovat h2:n alla, valintasivulla h1:n alla. */
  headingLevel: 2 | 3
  /** Näytetäänkö "Kenelle?"-teksti. Valintasivulla se auttaa valitsemaan, etusivulla riittää kuvaus. */
  showAudience?: boolean
  /** Kävijän valitsema polku: merkitään, jotta valintasivulla näkee, mitä polkua kulkee. */
  selected?: boolean
}

/** Oppimispolun kortti: nimi, kuvaus, aihealueet ja edistyminen. */
export function PathCard({ path, headingLevel, showAudience = false, selected = false }: PathCardProps) {
  const { progress } = useProgress()
  const count = countProgress(progress, path.modules)
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className="card card--link path-card">
      <Heading className="card__title">
        <Link to={`/polku/${path.id}`}>{path.title}</Link>
      </Heading>
      {selected && (
        <p className="path-card__selected">
          {/* Sama ulkoasu kuin aiheen "Valmis"-tilalla (StatusLabel), joten kontrasti on jo tarkistettu. */}
          <span className="status status--complete">
            <Icon name="check" /> Valitsemasi polku
          </span>
        </p>
      )}
      <p className="path-card__description">{path.description}</p>
      {showAudience && (
        <p className="path-card__audience">
          <strong>Kenelle?</strong> {path.audience}
        </p>
      )}
      <ul className="topic-chips" aria-label="Aiheet">
        {path.topics.map((t) => (
          <li key={t.id} className={`topic-chip topic-chip--${t.number % 4}`}>
            <span className="topic-chip__number mono">{t.number}</span>
            {t.title}
          </li>
        ))}
      </ul>
      <ProgressBar label={`Edistyminen: ${path.title}`} count={count} />
    </article>
  )
}
