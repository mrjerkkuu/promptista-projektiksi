/** Viivakuvakkeet (24 × 24, väri currentColor). Polut design-handoff/design/Components2.dc.html:stä. */
const PATHS = {
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 11v5M12 8h.01',
  warning: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  error: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 8v5M12 16h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  cross: 'M7 7l10 10M17 7L7 17',
  windows: 'M3 5h18v14H3zM3 9h18',
  mac: 'M5 6h14v10H5zM2 19h20',
  copy: 'M11 9h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM5 15V6a1 1 0 0 1 1-1h9',
  terminal: 'M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM7 9l3 3-3 3M12 15h5',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
} as const

export type IconName = keyof typeof PATHS

/** Koriste: kuvake on aina piilotettu ruudunlukijalta, joten vieressä on oltava teksti. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className ? `icon ${className}` : 'icon'} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  )
}
