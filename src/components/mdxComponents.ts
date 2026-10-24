import type { MDXComponents } from 'mdx/types'
import { Command } from './Command'
import { Os } from './Os'
import { Quiz } from './Quiz'
import { ReadMore } from './ReadMore'
import { Term } from './Term'
import { Tip } from './Tip'
import { VerifyStep } from './VerifyStep'

/**
 * Komponentit, joita tietopaketeissa (MDX) voi käyttää. Pidä tämä ja
 * MDX_COMPONENTS (src/schemas/content.ts) samoina.
 */
export const mdxComponents: MDXComponents = {
  Command,
  Os,
  Quiz,
  ReadMore,
  Term,
  Tip,
  VerifyStep,
}
