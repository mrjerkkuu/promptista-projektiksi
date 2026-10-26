import type { MDXComponents } from 'mdx/types'
import { Command } from './Command'
import { MdxLink } from './MdxLink'
import { NuppuSays } from './NuppuSays'
import { Os } from './Os'
import { Quiz } from './Quiz'
import { ReadMore } from './ReadMore'
import { TableWrap } from './TableWrap'
import { Term } from './Term'
import { Terminal } from './Terminal'
import { Tip } from './Tip'
import { VerifyStep } from './VerifyStep'

/**
 * Komponentit, joita tietopaketeissa (MDX) voi käyttää. Pidä tämä ja
 * MDX_COMPONENTS (src/schemas/content.ts) samoina.
 */
export const mdxComponents: MDXComponents = {
  a: MdxLink,
  table: TableWrap,
  Command,
  NuppuSays,
  Os,
  Quiz,
  ReadMore,
  Term,
  Terminal,
  Tip,
  VerifyStep,
}
