import iloitsee from '../assets/nuppu/nuppu-iloitsee.svg?raw'
import lepaa from '../assets/nuppu/nuppu-lepaa.svg?raw'
import miettii from '../assets/nuppu/nuppu-miettii.svg?raw'
import osoittaa from '../assets/nuppu/nuppu-osoittaa.svg?raw'
import vilkuttaa from '../assets/nuppu/nuppu-vilkuttaa.svg?raw'
import './Nuppu.css'

export type NuppuPose = 'vilkuttaa' | 'iloitsee' | 'miettii' | 'osoittaa' | 'lepaa'

const SVG: Record<NuppuPose, string> = { vilkuttaa, iloitsee, miettii, osoittaa, lepaa }

interface NuppuProps {
  pose: NuppuPose
  /** Leveys ja korkeus pikseleinä. */
  size: number
  /** Kevyt kellunta. Oletuksena Nuppu on paikallaan. */
  float?: boolean
  /** Käsi heilahtaa muutaman sekunnin välein. Vaikuttaa vain vilkuttaa-asentoon. */
  wave?: boolean
}

/**
 * Maskotti Nuppu. Aina koriste (aria-hidden). SVG upotetaan sellaisenaan, jotta
 * sen värit tulevat tokens.css:n muuttujista ja vaihtuvat teeman mukana.
 */
export function Nuppu({ pose, size, float = false, wave = false }: NuppuProps) {
  const className = ['nuppu', `nuppu--${pose}`, float && 'nuppu--float', wave && 'nuppu--wave'].filter(Boolean).join(' ')
  return (
    <span
      className={className}
      style={{ width: size, height: size }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: SVG[pose] }}
    />
  )
}
