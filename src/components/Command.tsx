import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../features/progress'
import { useContent, useLanguage, useT } from '../i18n'
import { copyText } from '../lib/clipboard'
import { formatDate, sourceLabel } from '../lib/format'
import { OS_LABEL, OS_LIST } from '../lib/os'
import type { Command as CommandData, Os } from '../schemas/content'
import { Icon } from './Icon'
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
  const t = useT()
  const command = useContent().commands[id]
  if (!command) return <p className="notice notice--error">{t.command.notFound(id)}</p>

  const variants = OS_LIST.filter((os) => command[os] !== undefined && (progress.os === null || progress.os === os))
  if (variants.length === 0) {
    const other = OS_LIST.find((os) => command[os] !== undefined)!
    return (
      <p className="muted command__not-needed">
        <Icon name="info" />
        {t.command.onlyOn(OS_LABEL[other])}
      </p>
    )
  }

  return (
    <figure className="command">
      <figcaption className="command__description">{command.description}</figcaption>
      {variants.map((os) => (
        <CommandLine
          key={os}
          text={command[os]!}
          os={os}
          showOs={progress.os === null}
          source={sourceFor(command, os)}
          verifiedAt={command.verifiedAt}
        />
      ))}
    </figure>
  )
}

interface CommandLineProps {
  text: string
  os: Os
  /** Ei käyttöjärjestelmävalintaa: versio otsikoidaan. */
  showOs: boolean
  source: string
  verifiedAt: string
}

function CommandLine({ text, os, showOs, source, verifiedAt }: CommandLineProps) {
  const { command: t } = useT()
  const language = useLanguage()
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
      {showOs && (
        <p className="command__os">
          <span className="chip">
            <Icon name={os} />
            {OS_LABEL[os]}
          </span>
        </p>
      )}
      <div className="command__box">
        <pre className="command__code">
          <code>{text}</code>
        </pre>
        <button type="button" className={`command__copy${status === 'copied' ? ' command__copy--copied' : ''}`} onClick={handleCopy}>
          <Icon name={status === 'copied' ? 'check' : 'copy'} />
          {status === 'copied' ? t.copied : t.copy}
          <span className="visually-hidden">{t.copyHidden(text)}</span>
        </button>
      </div>
      <p className="command__meta">
        <span aria-live="polite" className="visually-hidden">
          {status === 'copied' ? t.copiedLive : status === 'failed' ? t.copyFailedLive : ''}
        </span>
        {status === 'failed' && (
          <span className="command__error">
            <Icon name="error" />
            {t.copyFailed}{' '}
          </span>
        )}
        {t.source}{' '}
        <a href={source} target="_blank" rel="noreferrer">
          {sourceLabel(source)}
        </a>
        {' · '}
        {verifiedAt === 'TODO' ? t.unverified : t.verified(formatDate(verifiedAt, language))}
      </p>
    </div>
  )
}
