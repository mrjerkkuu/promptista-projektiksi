import type { ReactNode } from 'react'
import type { ModuleStatus } from '../../features/progress/model'
import type { Theme } from '../../features/progress/schema'
import type { GlossaryCategory } from '../../schemas/content'

/** Linkki tekstin keskellä: sanakirja antaa linkin tekstin, komponentti tekee siitä linkin. */
export type Linker = (label: ReactNode) => ReactNode

/**
 * Käyttöliittymän tekstit suomeksi. Sisältö (tietopaketit, sanasto, visat …) on
 * src/content/-kansiossa, tämä on vain sivuston oma teksti. Muiden kielten sanakirjoilla
 * on sama rakenne (TypeScript tarkistaa), joten puuttuva käännös kaataa tyyppitarkistuksen.
 */
export const fi = {
  siteName: 'Promptista projektiksi',
  metaDescription: 'Pelillistetty opas, jolla saat Claude Coden käyttöön ja teet ensimmäisen oman projektisi – ilman aiempaa kokemusta.',
  newTab: ' (avautuu uuteen välilehteen)',

  language: {
    label: 'Kieli',
    /** Yläpalkin painike, joka vaihtaa toiseen kieleen. Näytetään kohdekielellä. */
    switchTo: { fi: 'Suomeksi', en: 'English' },
  },

  layout: {
    skipLink: 'Siirry sisältöön',
    mainNav: 'Päävalikko',
    nav: {
      home: 'Etusivu',
      paths: 'Oppimispolut',
      glossary: 'Sanasto',
      troubleshooting: 'Vianmääritys',
      badges: 'Merkit',
      settings: 'Asetukset',
    },
    feedback: 'Anna palautetta',
    storageUnavailable: (link: Linker) => (
      <>
        Selaimesi ei salli tallennusta (esimerkiksi yksityinen selausikkuna). Sivu toimii, mutta edistymisesi ei säily, kun suljet välilehden.
        Voit siirtää edistymisen talteen {link('asetuksista')}.
      </>
    ),
    storageCorrupted: (link: Linker) => (
      <>Aiemmin tallennettua edistymistä ei voitu lukea, joten aloitetaan alusta. Jos sinulla on siirtokoodi, voit tuoda sen {link('asetuksista')}.</>
    ),
    footerLicense: 'Avoin lähdekoodi (MIT). Ei evästeitä, ei seurantaa: edistymisesi tallentuu vain omaan selaimeesi.',
    footerFeedback: (link: Linker) => <>Löysitkö virheen tai keksitkö parannuksen? {link('Anna palautetta')}</>,
  },

  home: {
    lead: 'Opettele tekemään omia verkkosivuja ja sovelluksia tekoälyn kanssa. Et tarvitse aiempaa kokemusta: aloitetaan perusteista, ja päädytään siihen, että sinulla on oma projekti netissä.',
    startHere: 'Aloita tästä',
    continue: 'Jatka siitä mihin jäit',
    choosePath: 'Valitse oppimispolku',
    allPathsDone: 'Olet käynyt kaikki oppimispolut läpi. Mahtavaa työtä!',
    pathDone: (title: string, link: Linker) => (
      <>
        Kävit polun ”{title}” läpi. Mahtavaa työtä! {link('Katso muut oppimispolut')}
      </>
    ),
    nuppuDoneTitle: 'Jee, teit sen!',
    nuppuDoneAll: 'Kuljit kaikki polut loppuun asti.',
    nuppuDonePath: 'Kuljit polun loppuun asti.',
    nuppuProud: 'Olen tosi ylpeä sinusta.',
    nuppuHello: 'Moi, olen Nuppu!',
    nuppuIntro: 'Kuljen mukanasi koko polun alusta loppuun.',
    osPickerNote: 'Näytämme ohjeet vain valitsemallesi käyttöjärjestelmälle. Voit vaihtaa valintaa myöhemmin yläpalkista.',
    osChosen: (os: string) => (
      <>
        Näet ohjeet <strong>{os}-koneelle</strong>. Voit vaihtaa valintaa yläpalkista.
      </>
    ),
    yourPath: 'Oppimispolkusi',
    allPaths: 'Kaikki oppimispolut',
    paths: 'Oppimispolut',
    choosePrompt: (link: Linker) => <>Valitse, mitä haluat oppia. {link('Katso oppimispolut')}</>,
    howHeading: 'Näin tämä toimii',
    how: [
      'Jokainen aihe on lyhyt tietopaketti ja jotain tekemistä: komento, harjoitus tai visa.',
      'Suositeltu järjestys on valmiina, mutta voit hypätä mihin tahansa aiheeseen.',
      'Edistymisesi tallentuu vain tähän selaimeen. Kirjautumista ei tarvita.',
    ],
    howHelp: (troubleshooting: Linker, glossary: Linker) => (
      <>
        Jos jokin menee pieleen, katso {troubleshooting('vianmääritys')}. Outo sana? {glossary('Sanasto')} auttaa.
      </>
    ),
  },

  paths: {
    title: 'Oppimispolut',
    lead: 'Valitse, mitä haluat oppia. Jokainen polku alkaa alusta, joten aiempaa kokemusta ei tarvita. Voit vaihtaa polkua milloin tahansa, eikä edistymisesi katoa.',
    selected: 'Valitsemasi polku',
    audience: 'Kenelle?',
    topics: 'Aiheet',
    progressOf: (title: string) => `Edistyminen: ${title}`,
    pathProgress: 'Koko polun edistyminen',
    pathDoneFeedback: 'Kävit koko polun läpi! Miltä se tuntui?',
    orderNote: 'Suositeltu järjestys on alla, mutta voit aloittaa mistä tahansa. Valinnainen bonustehtävä ei vaikuta edistymiseen.',
    optional: 'Valinnainen. ',
  },

  module: {
    breadcrumb: 'Murupolku',
    optionalBonus: 'Valinnainen bonustehtävä',
    osPrompt: 'Kun valitset käyttöjärjestelmän, näet vain sinua koskevat ohjeet.',
    loading: 'Ladataan tietopakettia…',
    untranslated: 'Tätä tietopakettia ei ole vielä käännetty, joten se näytetään suomeksi.',
    doneHeading: 'Valmista?',
    complete: 'Tämä aihe on valmis!',
    readNotPassed: 'Merkitsit tämän luetuksi. Aihe on valmis, kun olet vastannut visan kaikkiin kysymyksiin oikein.',
    topicDoneFeedback: (title: string) => `Koko aihealue ”${title}” on valmis! Miltä se tuntui?`,
    markRead: 'Olen lukenut tämän',
    unmarkRead: 'Luettu ✓ (peru merkintä)',
    feedback: (link: Linker) => <>Löysitkö virheen, tai jäikö jokin epäselväksi? {link('Kerro siitä')}</>,
    pager: 'Edellinen ja seuraava aihe',
    previous: 'Edellinen',
    next: 'Seuraava',
    pathEnd: 'Polun loppu',
    backToPath: 'Takaisin polun etusivulle',
  },

  status: {
    'not-started': 'Ei aloitettu',
    'in-progress': 'Kesken',
    complete: 'Valmis',
  } satisfies Record<ModuleStatus, string>,

  progress: {
    valueText: (complete: number, total: number) => `${complete}/${total} valmiina`,
    complete: 'valmiina',
    percent: (percent: number) => `${percent} %`,
  },

  notFound: {
    title: 'Sivua ei löytynyt',
    text: 'Etsimääsi sivua ei ole olemassa. Ehkä linkki on vanhentunut.',
    back: 'Palaa etusivulle',
  },

  badges: {
    title: 'Merkit',
    intro: (earned: ReactNode) => (
      <>
        Merkkejä saat, kun etenet polulla, teet harjoituksia ja saat asennukset kuntoon. Olet ansainnut {earned} merkkiä.
      </>
    ),
    shared: 'Yhteiset merkit',
    bonusGroup: 'Bonusmerkit',
    bonus: ' (bonus)',
    earned: (date: string) => `Ansaittu ${date}`,
    notEarned: 'Ei vielä ansaittu',
    toastTitle: (title: string) => `Uusi merkki: ${title}!`,
    seeAll: 'Katso merkit',
    close: 'Sulje',
    closeHidden: ' ilmoitus',
  },

  glossary: {
    title: 'Sanasto',
    intro: 'Kaikki sivuston termit lyhyesti aiheittain. Tekstissä alleviivattua sanaa napauttamalla näet saman selityksen.',
    search: 'Hae sanastosta',
    noResults: (query: string) => `Haulla ”${query}” ei löytynyt termejä. Kokeile jotain toista sanaa.`,
    results: (count: number) => (count === 1 ? 'Löytyi 1 termi.' : `Löytyi ${count} termiä.`),
    readMore: 'Lue lisää',
    readMoreHidden: (term: string) => ` termistä ${term}`,
    categories: {
      tekoaly: 'Tekoäly ja Claude Code',
      terminaali: 'Terminaali ja asennukset',
      tiedostot: 'Tiedostot ja kansiot',
      git: 'Git ja GitHub',
      tietoturva: 'Tietoturva',
      verkkosivut: 'Verkkosivut',
    } satisfies Record<GlossaryCategory, string>,
    seeInGlossary: 'Katso sanastosta',
  },

  troubleshooting: {
    title: 'Vianmääritys',
    intro: 'Jumissa? Se on täysin normaalia, ja jokainen koodaaja törmää näihin. Etsi alta ongelma, joka muistuttaa omaasi. Jos mikään ei auta, voit myös kopioida virheilmoituksen Claudelle ja kysyä, mitä se tarkoittaa.',
    showAll: (os: string) => `Näytä myös muiden käyttöjärjestelmien ongelmat (nyt näytetään: ${os})`,
    allPaths: 'Kaikilla poluilla',
    symptom: 'Oire:',
    fix: 'Näin korjaat:',
  },

  settings: {
    title: 'Asetukset',
    appearance: 'Kieli, käyttöjärjestelmä ja ulkoasu',
    transferHeading: 'Siirrä edistyminen toiselle laitteelle',
    transferIntro: 'Edistymisesi on tallessa vain tässä selaimessa. Jos haluat jatkaa toisella laitteella tai toisessa selaimessa, siirrä se koodilla tai tiedostolla.',
    exportHeading: 'Vie tältä laitteelta',
    showCode: 'Näytä siirtokoodi',
    download: 'Lataa tiedostona',
    fileName: 'promptista-projektiksi-edistyminen.json',
    codeLabel: 'Siirtokoodi (kopioi tämä kokonaan):',
    copyCode: 'Kopioi koodi',
    codeCopied: 'Koodi kopioitu!',
    codeCopyFailed: 'Kopiointi ei onnistunut. Valitse koodi ja kopioi se itse.',
    importHeading: 'Tuo toisella laitteella',
    importWarning: 'Huom! Tuonti korvaa tällä laitteella olevan edistymisen.',
    pasteLabel: 'Liitä siirtokoodi:',
    importButton: 'Tuo koodista',
    orFile: 'Tai valitse ladattu tiedosto:',
    chooseFile: 'Valitse tiedosto',
    noFile: 'Ei valittua tiedostoa',
    importOk: 'Edistyminen tuotu! Olet nyt samassa kohdassa kuin toisella laitteella.',
    importFailed: 'Koodia ei voitu lukea. Tarkista, että kopioit koko koodin, ja yritä uudelleen.',
    resetHeading: 'Aloita alusta',
    resetIntro: 'Poistaa kaiken edistymisesi tästä selaimesta: luetut aiheet, visavastaukset, merkit ja harjoitukset. Kieli- ja teemavalinta säilyvät.',
    resetButton: 'Aloita alusta…',
    resetConfirm: 'Haluatko varmasti poistaa kaiken edistymisesi?',
    resetCannotUndo: 'Tätä ei voi perua.',
    resetYes: 'Kyllä, aloita alusta',
    cancel: 'Peruuta',
    resetDone: 'Edistyminen nollattu. Tervetuloa uudelleen alkuun!',
  },

  theme: {
    label: 'Teema',
    options: {
      system: 'Laitteen mukaan',
      light: 'Vaalea',
      dark: 'Tumma',
    } satisfies Record<Theme, string>,
  },

  os: {
    compactLabel: 'Ohjeet:',
    question: 'Kumpaa tietokonetta käytät?',
    only: (os: string) => `Vain ${os}:`,
  },

  feedback: {
    title: 'Palaute',
    intro: 'Keksitkö, miten sivua voisi parantaa, tai löysitkö virheen? Kerro siitä! Jokainen palaute luetaan.',
    writeHeading: 'Kirjoita palautteesi',
    /** ”Palaute koskee aihetta 0.2 Terminaali.” */
    about: (kind: 'module' | 'topic' | 'path', name: string, link: Linker) => (
      <>
        Palaute koskee {{ module: 'aihetta', topic: 'aihealuetta', path: 'polkua' }[kind]} <strong>{name}</strong>.{' '}
        {link('Haluatko antaa yleistä palautetta?')}
      </>
    ),
    topicPage: (name: string) => `Aihealue ${name}`,
    pathPage: (name: string) => `Polku ${name}`,
    typeLabel: 'Mitä palaute koskee?',
    textLabel: 'Palautteesi',
    hints: {
      idea: 'Mitä sivulla voisi olla tai mitä voisi tehdä toisin? Kerro myös, miten idea auttaisi sinua.',
      virhe: 'Mikä kohta oli väärin tai jäi epäselväksi? Kopioi mukaan lause, jota tarkoitat.',
      komento: 'Mikä komento ei toiminut, ja mitä tapahtui? Liitä mukaan virheilmoitus.',
    },
    maxLength: (max: string) => `Enintään ${max} merkkiä.`,
    privacy:
      'Älä kirjoita palautteeseen salasanoja, API-avaimia tai muita henkilötietoja. Jos liität mukaan virheilmoituksen, tarkista, ettei siinä näy esimerkiksi omaa nimeäsi.',
    sendHeading: 'Lähetä palaute',
    sendIntro:
      'Palaute ei lähde suoraan tältä sivulta. Valitse alta, kumpi tapa sopii sinulle: sivu avaa sen valmiiksi täytettynä, ja lähetät palautteen siellä.',
    githubText: 'Tarvitset GitHub-tilin. Palaute näkyy kaikille, ja näet, miten se etenee.',
    githubButton: 'Jatka GitHubiin',
    emailHeading: 'Sähköposti',
    emailText: 'Et tarvitse tiliä. Palaute näkyy vain sivuston tekijälle.',
    emailButton: 'Jatka sähköpostiin',
    emailFallback: (email: string) => (
      <>
        Jos sähköpostiohjelmasi ei aukea, lähetä viesti osoitteeseen <strong>{email}</strong>.
      </>
    ),
    prompt: (link: Linker) => <>{link('Kerro palautteessa')}, mitä parantaisit.</>,
  },

  unreviewed: {
    label: 'Ei vielä tarkastettu',
    compact: 'Tämä polku on uusi, eikä sivuston tekijä ole vielä käynyt sitä läpi. Ohjeissa voi olla virheitä.',
    full: (link: Linker) => (
      <>
        Moi, Nuppu tässä! Tämä polku on aivan uusi, eikä sivuston tekijä ole vielä käynyt sitä läpi. Ohjeissa voi olla virheitä tai kohtia,
        jotka eivät vastaa sovellusta. Jos huomaat jotain outoa, {link('kerro siitä')}, niin autat korjaamaan polun.
      </>
    ),
  },

  choices: {
    correctHidden: ' (oikein)',
    wrongHidden: ' (väärin)',
    correct: 'Oikein!',
    wrong: 'Ei aivan.',
  },

  command: {
    notFound: (id: string) => `Komentoa ”${id}” ei löytynyt.`,
    onlyOn: (os: string) => `Tätä komentoa tarvitaan vain ${os}-koneilla.`,
    copy: 'Kopioi',
    copied: 'Kopioitu!',
    copyHidden: (command: string) => ` komento ${command}`,
    copiedLive: 'Komento kopioitu leikepöydälle.',
    copyFailedLive: 'Kopiointi ei onnistunut. Valitse komento ja kopioi se itse.',
    copyFailed: 'Kopiointi ei onnistunut, valitse teksti ja kopioi se itse.',
    source: 'Lähde:',
    unverified: 'tarkistamatta',
    verified: (date: string) => `tarkistettu ${date}`,
  },

  quiz: {
    notFound: 'Visaa ei löytynyt.',
    title: 'Visa',
    intro: 'Valitse vastaus. Saat palautteen heti, ja voit yrittää uudelleen niin monta kertaa kuin haluat.',
    passed: 'Visa läpäisty! Kaikki vastaukset ovat oikein.',
  },

  verify: {
    notFound: (id: string) => `Varmistusta ”${id}” ei löytynyt.`,
    title: (tool: string) => `Varmistus: ${tool}`,
    troubleshooting: (title: string) => `Vianmääritys: ${title}`,
  },

  terminal: {
    notFound: (id: string) => `Harjoitusta ”${id}” ei löytynyt.`,
    macShell: 'Pääte (zsh)',
    exercise: (title: string) => `Harjoitus: ${title}`,
    showHint: 'Näytä vihje',
    osNotChosen: (os: string) => `Harjoitus on nyt ${os}-tyylinen. Valitse oma käyttöjärjestelmäsi yläpalkista.`,
    output: 'Terminaalin tulosteet',
    emptyHint: 'Kirjoita komento alle ja paina Enter. Komento help näyttää ohjeen.',
    promptHidden: 'Komento, kehote: ',
    run: 'Suorita',
    alreadyDone: 'Olet jo suorittanut tämän harjoituksen. Voit harjoitella lisää niin paljon kuin haluat.',
    restart: 'Aloita harjoitus alusta',
    nextStep: (
      <>
        {' '}
        Jatka sitten sivua alaspäin: sivun lopusta pääset <strong>Seuraava</strong>-painikkeella seuraavaan aiheeseen.
      </>
    ),
    lastStep: <> Jatka sitten sivua alaspäin: tämä on polun viimeinen aihe, ja sivun lopusta pääset takaisin polun etusivulle.</>,
  },

  /** Kuvakaappauksen avauspainike: ”Näytä kuva: …” ja auki ollessa ”Piilota kuva: …”. */
  screenshot: {
    show: 'Näytä',
    hide: 'Piilota',
    image: (title: string) => `kuva: ${title}`,
  },

  mdx: {
    readMore: 'Lue lisää',
    nuppuSays: 'Nuppu sanoo: ',
    tipWarning: 'Huomio',
    tipInfo: 'Vinkki',
  },
}

export type UiStrings = typeof fi
