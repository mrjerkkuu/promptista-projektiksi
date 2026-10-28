import type { ScreenshotSizes } from '../schemas/content'
import sizes from '../assets/kuvakaappaukset/kuvat.json'
import './Screenshot.css'

/**
 * Kuvakaappaukset: tiedoston nimi = kuvan tunniste. no-inline: pienetkään kuvat
 * eivät päädy pääpakettiin, vaan ladataan vasta, kun aihe avataan.
 */
const URLS = import.meta.glob<string>('../assets/kuvakaappaukset/*.webp', { query: '?no-inline', import: 'default', eager: true })
const SIZES: ScreenshotSizes = sizes

interface ScreenshotProps {
  /** Kuvan tunniste, esim. s05-lupakysely (src/assets/kuvakaappaukset/<id>.webp). */
  id: string
  /** Vaihtoehtoinen teksti: mitä kuvassa on ja mihin kannattaa kiinnittää huomiota. */
  alt: string
  /** Pieni kuvake tekstin seassa (”napsauta [kuvake]”). Oletuksena kuva on oma lohkonsa. */
  inline?: boolean
}

/**
 * Kuvakaappaus tietopaketissa. Kuva latautuu vasta, kun se on tulossa näkyviin,
 * ja width/height varaavat sille tilan, joten teksti ei hypi latauksen aikana.
 * Build tarkistaa, että kuva on olemassa ja vaihtoehtoinen teksti on kirjoitettu.
 */
export function Screenshot({ id, alt, inline = false }: ScreenshotProps) {
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
  return <figure className="screenshot">{img}</figure>
}
