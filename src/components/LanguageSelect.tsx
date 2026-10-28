import { useEffect, useId } from 'react'
import { useNavigate } from 'react-router'
import { useProgress } from '../features/progress'
import { LANGUAGE_NAME, LANGUAGES, languageSchema, useLanguage, useT, type Language } from '../i18n'

/**
 * Yläpalkin kielipainikkeet: yksi painike jokaiselle muulle kielelle. Painikkeen teksti on
 * kohdekielellä ("English", "Suomeksi"), jotta sen löytää, vaikka ei ymmärtäisi sivun nykyistä kieltä.
 */
export function LanguageToggle() {
  const { dispatch } = useProgress()
  const t = useT()
  const current = useLanguage()
  return (
    <>
      {LANGUAGES.filter((l) => l !== current).map((l) => (
        <button key={l} type="button" lang={l} className="button button--secondary button--small" onClick={() => dispatch({ type: 'setLanguage', language: l })}>
          {t.language.switchTo[l]}
        </button>
      ))}
    </>
  )
}

/** Asetussivun kielivalinta. Kielten nimet ovat omalla kielellään. */
export function LanguageSelect() {
  const { dispatch } = useProgress()
  const t = useT()
  const current = useLanguage()
  const id = useId()
  return (
    <div className="theme-select">
      <label htmlFor={id}>{t.language.label} </label>
      <span className="select">
        <select id={id} value={current} onChange={(e) => dispatch({ type: 'setLanguage', language: languageSchema.parse(e.target.value) })}>
          {LANGUAGES.map((l) => (
            <option key={l} value={l} lang={l}>
              {LANGUAGE_NAME[l]}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}

/** Vie kielen <html lang>-attribuuttiin (ruudunlukijan ääntämys) ja sivun kuvaukseen. */
export function LanguageSync() {
  const language = useLanguage()
  const t = useT()
  useEffect(() => {
    document.documentElement.lang = language
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription)
  }, [language, t])
  return null
}

/**
 * Jaettava kielilinkki: #/en avaa sivuston englanniksi ja #/fi suomeksi. Valinta tallentuu
 * kuten yläpalkin painikkeesta, ja kävijä ohjataan etusivulle.
 */
export function LanguageRoute({ language }: { language: Language }) {
  const { dispatch } = useProgress()
  const navigate = useNavigate()
  useEffect(() => {
    dispatch({ type: 'setLanguage', language })
    navigate('/', { replace: true })
  }, [dispatch, navigate, language])
  return null
}
