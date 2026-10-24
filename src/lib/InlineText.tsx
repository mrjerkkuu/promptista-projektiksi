import { Fragment } from 'react'

/** Näyttää tekstin, jossa `takahipsujen` välissä oleva osa on koodia. */
export function InlineText({ text }: { text: string }) {
  const parts = text.split('`')
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>))}
    </>
  )
}
