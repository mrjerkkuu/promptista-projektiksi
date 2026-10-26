import type { NUPPU_POSES } from '../schemas/content'
import iloitsee from '../assets/nuppu/nuppu-iloitsee.svg?raw'
import istuu from '../assets/nuppu/nuppu-istuu.svg?raw'
import julkaisee from '../assets/nuppu/nuppu-julkaisee.svg?raw'
import kansio from '../assets/nuppu/nuppu-kansio.svg?raw'
import keksii from '../assets/nuppu/nuppu-keksii.svg?raw'
import koodaa from '../assets/nuppu/nuppu-koodaa.svg?raw'
import kurkistaa from '../assets/nuppu/nuppu-kurkistaa.svg?raw'
import lepaa from '../assets/nuppu/nuppu-lepaa.svg?raw'
import lukee from '../assets/nuppu/nuppu-lukee.svg?raw'
import miettii from '../assets/nuppu/nuppu-miettii.svg?raw'
import mitali from '../assets/nuppu/nuppu-mitali.svg?raw'
import osoittaa from '../assets/nuppu/nuppu-osoittaa.svg?raw'
import rakentaa from '../assets/nuppu/nuppu-rakentaa.svg?raw'
import suojaa from '../assets/nuppu/nuppu-suojaa.svg?raw'
import tallentaa from '../assets/nuppu/nuppu-tallentaa.svg?raw'
import tarkistaa from '../assets/nuppu/nuppu-tarkistaa.svg?raw'
import tutkii from '../assets/nuppu/nuppu-tutkii.svg?raw'
import varoittaa from '../assets/nuppu/nuppu-varoittaa.svg?raw'
import vilkuttaa from '../assets/nuppu/nuppu-vilkuttaa.svg?raw'
import './Nuppu.css'

export type NuppuPose = (typeof NUPPU_POSES)[number]

const SVG: Record<NuppuPose, string> = {
  vilkuttaa,
  iloitsee,
  miettii,
  osoittaa,
  lepaa,
  kurkistaa,
  istuu,
  mitali,
  varoittaa,
  lukee,
  koodaa,
  tutkii,
  tarkistaa,
  rakentaa,
  julkaisee,
  keksii,
  suojaa,
  tallentaa,
  kansio,
}

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
