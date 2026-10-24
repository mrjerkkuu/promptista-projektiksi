import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { missions } from '../content'
import { useProgress } from '../features/progress'
import { createShell, execute, isMissionComplete, prompt, type Line, type ShellState } from '../features/terminal-sim/shell'
import { InlineText } from '../lib/InlineText'
import { OS_LABEL } from '../lib/os'
import type { Mission, Os } from '../schemas/content'
import './Terminal.css'

interface TerminalProps {
  mission: string
}

/** Terminaalisimulaattori: turvallinen harjoitusympäristö selaimessa (SUUNNITELMA.md luku 7). */
export function Terminal({ mission: missionId }: TerminalProps) {
  const { progress } = useProgress()
  const mission = missions[missionId]
  if (!mission) return <p className="notice notice--error">Harjoitusta ”{missionId}” ei löytynyt.</p>
  const os: Os = progress.os ?? 'windows'
  // key: käyttöjärjestelmän vaihtuessa simulaattori alkaa alusta oikealla kehotteella.
  return <TerminalSession key={os} missionId={missionId} mission={mission} os={os} osChosen={progress.os !== null} />
}

interface SessionProps {
  missionId: string
  mission: Mission
  os: Os
  osChosen: boolean
}

interface HistoryEntry {
  prompt: string
  lines: Line[]
}

function TerminalSession({ missionId, mission, os, osChosen }: SessionProps) {
  const { progress, dispatch } = useProgress()
  const [shell, setShell] = useState<ShellState>(() => createShell(os, mission))
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [justCompleted, setJustCompleted] = useState(false)
  const screen = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const goalId = useId()
  const alreadyDone = progress.missions[missionId] !== undefined

  useEffect(() => {
    screen.current?.scrollTo?.({ top: screen.current.scrollHeight })
  }, [entries])

  function submit(e: FormEvent) {
    e.preventDefault()
    const command = input
    const result = execute(shell, command)
    const echo: Line = { kind: 'input', text: command }
    setEntries((prev) => (result.clear ? [] : [...prev, { prompt: prompt(shell), lines: [echo, ...result.output] }]))
    setShell(result.state)
    setInput('')
    setHistoryIndex(null)
    if (command.trim() !== '') {
      setHistory((h) => [...h, command])
      dispatch({ type: 'commandRun' })
    }
    if (!alreadyDone && !justCompleted && isMissionComplete(result.state, mission)) {
      setJustCompleted(true)
      dispatch({ type: 'completeMission', missionId, at: new Date().toISOString() })
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    if (history.length === 0) return
    e.preventDefault()
    let index = historyIndex ?? history.length
    index = e.key === 'ArrowUp' ? Math.max(0, index - 1) : index + 1
    if (index >= history.length) {
      setHistoryIndex(null)
      setInput('')
    } else {
      setHistoryIndex(index)
      setInput(history[index])
    }
  }

  function restart() {
    setShell(createShell(os, mission))
    setEntries([])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <section className="terminal" aria-label={`Harjoitus: ${mission.title}`}>
      <div className="terminal__mission">
        <h3 className="terminal__title">Harjoitus: {mission.title}</h3>
        <p id={goalId}>
          <InlineText text={mission.goal} />
        </p>
        {mission.hint && (
          <details>
            <summary>Näytä vihje</summary>
            <p>
              <InlineText text={mission.hint} />
            </p>
          </details>
        )}
        {!osChosen && <p className="muted">Harjoitus on nyt {OS_LABEL[os]}-tyylinen. Valitse oma käyttöjärjestelmäsi yläpalkista.</p>}
      </div>

      <div className="terminal__window">
        <div className="terminal__screen" ref={screen} role="log" aria-label="Terminaalin tulosteet">
          {entries.length === 0 && <p className="terminal__line terminal__line--hint">Kirjoita komento alle ja paina Enter. Komento help näyttää ohjeen.</p>}
          {entries.map((entry, i) => (
            <div key={i}>
              {entry.lines.map((line, j) => (
                <p key={j} className={`terminal__line terminal__line--${line.kind}`}>
                  {line.kind === 'input' && <span className="terminal__prompt">{entry.prompt}</span>}
                  {line.text}
                </p>
              ))}
            </div>
          ))}
        </div>
        <form className="terminal__form" onSubmit={submit}>
          <label htmlFor={inputId} className="terminal__prompt terminal__prompt--input">
            <span className="visually-hidden">Komento, kehote: </span>
            {prompt(shell)}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            className="terminal__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-describedby={goalId}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
          />
          <button type="submit" className="button button--small terminal__run">
            Suorita
          </button>
        </form>
      </div>

      <div aria-live="polite">
        {(justCompleted || alreadyDone) && (
          <p className="notice notice--success">
            {justCompleted ? mission.success : 'Olet jo suorittanut tämän harjoituksen. Voit harjoitella lisää niin paljon kuin haluat.'}
          </p>
        )}
      </div>
      <button type="button" className="button button--secondary button--small" onClick={restart}>
        Aloita harjoitus alusta
      </button>
    </section>
  )
}
