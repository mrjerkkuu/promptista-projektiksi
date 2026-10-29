import { useT } from '../i18n'
import { SCREENSHOT_MAX_VISIBLE_HEIGHT, type ScreenshotSizes } from '../schemas/content'
import sizes from '../assets/kuvakaappaukset/kuvat.json'
import './Screenshot.css'

/**
 * Kuvakaappaukset: tiedoston nimi = kuvan tunniste. no-inline: pienetkään kuvat
 * eivät päädy pääpakettiin, vaan ladataan vasta, kun kuva avataan.
 */
const URLS = import.meta.glob<string>('../assets/kuvakaappaukset/*.webp', { query: '?no-inline', import: 'default', eager: true })
const SIZES: ScreenshotSizes = sizes

interface ScreenshotProps {
  /** Kuvan tunniste, esim. s05-lupakysely (src/assets/kuvakaappaukset/<id>.webp). */
  id: string
  /** Vaihtoehtoinen teksti: mitä kuvassa on ja mihin kannattaa kiinnittää huomiota. */
  alt: string
  /** Lyhyt nimi avauspainikkeeseen: ”Näytä kuva: <title>”. Pakollinen korkealle kuvalle, jonka voi avata. */
  title?: string
  /** Pieni kuvake tekstin seassa (”napsauta [kuvake]”). Näkyy aina. */
  inline?: boolean
}

/**
 * Kuvakaappaus tietopaketissa. Matala kuva (esim. valintarivi tai yksi painike)
 * näkyy suoraan, koska se ei pidennä ohjetta. Korkea kuva on piilossa, kunnes
 * lukija avaa sen painikkeesta ”Näytä kuva”, ja se latautuu vasta avattaessa.
 * width/height varaavat kuvalle tilan, joten teksti ei hypi.
 * Build tarkistaa, että kuva on olemassa ja tekstit on kirjoitettu.
 */
export function Screenshot({ id, alt, title, inline = false }: ScreenshotProps) {
  const { screenshot: t } = useT()
  const src = URLS[`../assets/kuvakaappaukset/${id}.webp`]
  const size = SIZES[id]
  if (!src || !size) return null
  const img = (
    <img
      className={inline ? 'screenshot-icon' : 'screenshot__image'}
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      loading="lazy"
      decoding="async"
    />
  )
  if (inline) return img
  if (size.height <= SCREENSHOT_MAX_VISIBLE_HEIGHT) return <figure className="screenshot">{img}</figure>
  return (
    <details className="screenshot">
      <summary className="screenshot__toggle">
        <span>
          <span className="screenshot__show">{t.show}</span>
          <span className="screenshot__hide">{t.hide}</span> {t.image(title ?? '')}
        </span>
      </summary>
      {img}
    </details>
  )
}
