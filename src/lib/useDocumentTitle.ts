import { useEffect } from 'react'

const SITE_NAME = 'Promptista projektiksi'

/** Asettaa selaimen välilehden otsikon. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} – ${SITE_NAME}` : SITE_NAME
  }, [title])
}
