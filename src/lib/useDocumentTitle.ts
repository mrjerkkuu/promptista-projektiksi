import { useEffect } from 'react'
import { useT } from '../i18n'

/** Asettaa selaimen välilehden otsikon. Sivuston nimi on sivuston kielellä. */
export function useDocumentTitle(title?: string) {
  const { siteName } = useT()
  useEffect(() => {
    document.title = title ? `${title} – ${siteName}` : siteName
  }, [title, siteName])
}
