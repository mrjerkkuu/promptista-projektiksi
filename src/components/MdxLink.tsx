import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n'

/**
 * Linkit tietopaketeissa. Sisäiset linkit kirjoitetaan muodossa "#/polku" ja
 * ne hoitaa reititin. Ulkoiset linkit avautuvat uuteen välilehteen.
 */
export function MdxLink({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const t = useT()
  if (href.startsWith('#/')) {
    return (
      <Link to={href.slice(1)} {...rest}>
        {children}
      </Link>
    )
  }
  const external = /^https?:\/\//.test(href)
  return (
    <a href={href} {...rest} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
      {external && <span className="visually-hidden">{t.newTab}</span>}
    </a>
  )
}
