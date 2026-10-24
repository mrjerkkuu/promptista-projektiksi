import type { TableHTMLAttributes } from 'react'

/** Tietopaketin taulukko kääreessä, joka vierii kapealla näytöllä (base.css .table-wrap). */
export function TableWrap(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  )
}
