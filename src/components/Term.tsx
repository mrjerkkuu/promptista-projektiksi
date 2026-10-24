import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { glossary } from '../content'
import './Term.css'

interface TermProps {
  id: string
  children: ReactNode
}

/**
 * Sanastotermi tekstin seassa. Hiiren vienti päälle (kone) tai napautus
 * (mobiili ja näppäimistö) näyttää lyhyen selityksen ja linkin sanastoon.
 */
export function Term({ id, children }: TermProps) {
  const entry = glossary[id]
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const wrapper = useRef<HTMLSpanElement>(null)
  const popover = useRef<HTMLSpanElement>(null)
  const popoverId = useId()
  const open = hovered || pinned

  // Hiiren vienti päälle näyttää selityksen (vain hiirellä; kosketuksessa napautus).
  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && setHovered(true)
    const leave = (e: PointerEvent) => e.pointerType === 'mouse' && setHovered(false)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPinned(false)
        setHovered(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!pinned) return
    function onPointerDown(e: PointerEvent) {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setPinned(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [pinned])

  // Pidetään selitys näkymän sisällä kapeillakin näytöillä (ei vaakavieritystä).
  useLayoutEffect(() => {
    const el = popover.current
    if (!open || !el) return
    el.style.transform = ''
    const rect = el.getBoundingClientRect()
    const margin = 8
    let shift = 0
    if (rect.right > window.innerWidth - margin) shift = window.innerWidth - margin - rect.right
    if (rect.left + shift < margin) shift = margin - rect.left
    if (shift !== 0) el.style.transform = `translateX(${shift}px)`
  }, [open])

  if (!entry) return <>{children}</>

  return (
    <span className="term" ref={wrapper}>
      <button
        type="button"
        className="term__button"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => {
          setPinned((p) => !p)
          setHovered(false)
        }}
      >
        {children}
      </button>
      <span
        id={popoverId}
        ref={popover}
        className="term__popover"
        role="note"
        hidden={!open}
      >
        <strong>{entry.term}:</strong> {entry.definition}{' '}
        <Link to={`/sanasto/${id}`}>Katso sanastosta</Link>
      </span>
    </span>
  )
}
