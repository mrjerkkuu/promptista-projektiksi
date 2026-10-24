import { useEffect, useRef, useState } from 'react'
import { commands } from '../content'
import { useProgress } from '../features/progress'
import { copyText } from '../lib/clipboard'
import { formatDate, sourceLabel } from '../lib/format'
import { OS_LABEL, OS_LIST } from '../lib/os'
import type { Command as CommandData, Os } from '../schemas/content'
import './Command.css'

interface CommandProps {
  id: string
}

function sourceFor(command: CommandData, os: Os): string {
  return typeof command.source === 'string' ? command.source : command.source[os]
}

/** Kopioitava komento commands.json:sta valitun käyttöjärjestelmän mukaan. */
export function Command({ id }: CommandProps) {
  const { progress } = useProgress()
  const command = commands[id]
  if (!command) return <p className="notice notice--error">Komentoa ”{id}” ei löytynyt.</p>

  const variants = OS_LIST.filter((os) => command[os] !== undefined && (progress.os === null || progress.os === os))
  if (variants.length === 0) {
    const other = OS_LIST.find((os) => command[os] !== undefined)!
    return <p className="muted">Tätä komentoa tarvitaan vain {OS_LABEL[other]}-koneilla.</p>
  }

  return (
    <figure className="command">
      <figcaption className="command__description">{command.description}</figcaption>
      {variants.map((os) => (
        <CommandLine
          key={os}
          text={command[os]!}
          label={progress.os === null ? OS_LABEL[os] : undefined}
          source={sourceFor(command, os)}
          verifiedAt={command.verifiedAt}
        />
      ))}
    </figure>
  )
}

interface CommandLineProps {
  text: string
  label?: string
  source: string
  verifiedAt: string
}

function CommandLine({ text, label, source, verifiedAt }: CommandLineProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function handleCopy() {
    const ok = await copyText(text)
    setStatus(ok ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <div className="command__variant">
      {label && <p className="command__os">{label}</p>}
      <div className="command__box">
        <pre className="command__code">
          <code>{text}</code>
        </pre>
        <button type="button" className="button button--small command__copy" onClick={handleCopy}>
          {status === 'copied' ? 'Kopioitu!' : 'Kopioi'}
          <span className="visually-hidden"> komento {text}</span>
        </button>
      </div>
      <p className="command__meta">
        <span aria-live="polite" className="visually-hidden">
          {status === 'copied' ? 'Komento kopioitu leikepöydälle.' : status === 'failed' ? 'Kopiointi ei onnistunut. Valitse komento ja kopioi se itse.' : ''}
        </span>
        {status === 'failed' && <span className="command__error">Kopiointi ei onnistunut, valitse teksti ja kopioi se itse. </span>}
        Lähde:{' '}
        <a href={source} target="_blank" rel="noreferrer">
          {sourceLabel(source)}
        </a>
        {' · '}
        {verifiedAt === 'TODO' ? 'tarkistamatta' : `tarkistettu ${formatDate(verifiedAt)}`}
      </p>
    </div>
  )
}
