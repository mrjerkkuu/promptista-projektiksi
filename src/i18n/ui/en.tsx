import type { Linker, UiStrings } from './fi'

/** Käyttöliittymän tekstit englanniksi. Rakenne on sama kuin fi.tsx:ssä. */
export const en: UiStrings = {
  siteName: 'From Prompt to Project',
  metaDescription: 'A gamified guide that gets you set up with Claude Code and through your first project of your own – no prior experience needed.',
  newTab: ' (opens in a new tab)',

  language: {
    label: 'Language',
    switchTo: { fi: 'Suomeksi', en: 'English' },
  },

  layout: {
    skipLink: 'Skip to content',
    mainNav: 'Main menu',
    nav: {
      home: 'Home',
      paths: 'Learning paths',
      glossary: 'Glossary',
      troubleshooting: 'Troubleshooting',
      badges: 'Badges',
      settings: 'Settings',
    },
    feedback: 'Give feedback',
    storageUnavailable: (link: Linker) => (
      <>
        Your browser doesn’t allow saving (for example, in a private window). The site works, but your progress won’t be kept when you close the
        tab. You can save your progress in {link('Settings')}.
      </>
    ),
    storageCorrupted: (link: Linker) => (
      <>Your previously saved progress couldn’t be read, so you’re starting from the beginning. If you have a transfer code, you can import it in {link('Settings')}.</>
    ),
    footerLicense: 'Open source (MIT). No cookies, no tracking: your progress is saved only in your own browser.',
    footerFeedback: (link: Linker) => <>Found a mistake or thought of an improvement? {link('Give feedback')}</>,
  },

  home: {
    lead: 'Learn to build your own websites and apps with AI. You don’t need any prior experience: we start from the basics and finish with a project of your own on the web.',
    startHere: 'Start here',
    continue: 'Continue where you left off',
    choosePath: 'Choose a learning path',
    allPathsDone: 'You’ve completed every learning path. Amazing work!',
    pathDone: (title: string, link: Linker) => (
      <>
        You completed the path “{title}”. Amazing work! {link('See the other learning paths')}
      </>
    ),
    nuppuDoneTitle: 'Yay, you did it!',
    nuppuDoneAll: 'You walked every path all the way to the end.',
    nuppuDonePath: 'You walked the path all the way to the end.',
    nuppuProud: 'I’m so proud of you.',
    nuppuHello: 'Hi, I’m Nuppu!',
    nuppuIntro: 'I’ll walk with you from the start of the path to the very end.',
    osPickerNote: 'We’ll only show instructions for the operating system you choose. You can change it later from the top bar.',
    osChosen: (os: string) => (
      <>
        You’re seeing instructions for a <strong>{os} computer</strong>. You can change this from the top bar.
      </>
    ),
    yourPath: 'Your learning path',
    allPaths: 'All learning paths',
    paths: 'Learning paths',
    choosePrompt: (link: Linker) => <>Choose what you want to learn. {link('See the learning paths')}</>,
    howHeading: 'How this works',
    how: [
      'Every topic is a short read plus something to do: a command, an exercise or a quiz.',
      'There’s a recommended order, but you can jump to any topic you like.',
      'Your progress is saved only in this browser. No sign-in needed.',
    ],
    howHelp: (troubleshooting: Linker, glossary: Linker) => (
      <>
        If something goes wrong, check {troubleshooting('Troubleshooting')}. Strange word? The {glossary('Glossary')} can help.
      </>
    ),
  },

  paths: {
    title: 'Learning paths',
    lead: 'Choose what you want to learn. Every path starts from the beginning, so no prior experience is needed. You can switch paths at any time, and your progress won’t be lost.',
    selected: 'Your chosen path',
    audience: 'Who is it for?',
    topics: 'Topics',
    progressOf: (title: string) => `Progress: ${title}`,
    pathProgress: 'Progress on the whole path',
    pathDoneFeedback: 'You completed the whole path! How did it feel?',
    orderNote: 'The recommended order is below, but you can start anywhere. Optional bonus tasks don’t count towards your progress.',
    optional: 'Optional. ',
  },

  module: {
    breadcrumb: 'Breadcrumb',
    optionalBonus: 'Optional bonus task',
    osPrompt: 'Once you choose your operating system, you’ll only see the instructions that apply to you.',
    loading: 'Loading the topic…',
    untranslated: 'This topic hasn’t been translated into English yet, so it’s shown in Finnish.',
    doneHeading: 'All done?',
    complete: 'This topic is complete!',
    readNotPassed: 'You marked this as read. The topic is complete once you’ve answered every quiz question correctly.',
    topicDoneFeedback: (title: string) => `You completed the whole section “${title}”! How did it feel?`,
    markRead: 'I’ve read this',
    unmarkRead: 'Read ✓ (undo)',
    feedback: (link: Linker) => <>Found a mistake, or was something unclear? {link('Let us know')}</>,
    pager: 'Previous and next topic',
    previous: 'Previous',
    next: 'Next',
    pathEnd: 'End of the path',
    backToPath: 'Back to the path’s front page',
  },

  status: {
    'not-started': 'Not started',
    'in-progress': 'In progress',
    complete: 'Complete',
  },

  progress: {
    valueText: (complete: number, total: number) => `${complete}/${total} complete`,
    complete: 'complete',
    percent: (percent: number) => `${percent}%`,
  },

  notFound: {
    title: 'Page not found',
    text: 'The page you’re looking for doesn’t exist. Maybe the link is out of date.',
    back: 'Back to the home page',
  },

  badges: {
    title: 'Badges',
    intro: (earned) => (
      <>
        You earn badges as you make progress on a path, do exercises and get your installations working. You’ve earned {earned} badges.
      </>
    ),
    shared: 'Shared badges',
    bonusGroup: 'Bonus badges',
    bonus: ' (bonus)',
    earned: (date: string) => `Earned ${date}`,
    notEarned: 'Not earned yet',
    toastTitle: (title: string) => `New badge: ${title}!`,
    seeAll: 'See your badges',
    close: 'Close',
    closeHidden: ' notification',
  },

  glossary: {
    title: 'Glossary',
    intro: 'Every term on the site, briefly explained and grouped by topic. Tap an underlined word in the text to see the same explanation.',
    search: 'Search the glossary',
    noResults: (query: string) => `No terms found for “${query}”. Try another word.`,
    results: (count: number) => (count === 1 ? 'Found 1 term.' : `Found ${count} terms.`),
    readMore: 'Read more',
    readMoreHidden: (term: string) => ` about ${term}`,
    categories: {
      tekoaly: 'AI and Claude Code',
      terminaali: 'The terminal and installations',
      tiedostot: 'Files and folders',
      git: 'Git and GitHub',
      tietoturva: 'Security',
      verkkosivut: 'Websites',
    },
    seeInGlossary: 'See the glossary',
  },

  troubleshooting: {
    title: 'Troubleshooting',
    intro: 'Stuck? That’s completely normal, and every coder runs into these. Find a problem below that looks like yours. If nothing helps, you can also copy the error message to Claude and ask what it means.',
    showAll: (os: string) => `Also show problems for other operating systems (now showing: ${os})`,
    allPaths: 'On every path',
    symptom: 'Symptom:',
    fix: 'How to fix it:',
  },

  settings: {
    title: 'Settings',
    appearance: 'Language, operating system and appearance',
    transferHeading: 'Move your progress to another device',
    transferIntro: 'Your progress is stored only in this browser. If you want to continue on another device or in another browser, move it with a code or a file.',
    exportHeading: 'Export from this device',
    showCode: 'Show transfer code',
    download: 'Download as a file',
    fileName: 'from-prompt-to-project-progress.json',
    codeLabel: 'Transfer code (copy all of it):',
    copyCode: 'Copy code',
    codeCopied: 'Code copied!',
    codeCopyFailed: 'Copying didn’t work. Select the code and copy it yourself.',
    importHeading: 'Import on the other device',
    importWarning: 'Note! Importing replaces the progress on this device.',
    pasteLabel: 'Paste the transfer code:',
    importButton: 'Import from code',
    orFile: 'Or choose a downloaded file:',
    chooseFile: 'Choose file',
    noFile: 'No file chosen',
    importOk: 'Progress imported! You’re now at the same point as on your other device.',
    importFailed: 'The code couldn’t be read. Check that you copied the whole code and try again.',
    resetHeading: 'Start over',
    resetIntro: 'Deletes all your progress from this browser: topics read, quiz answers, badges and exercises. Your language and theme choices are kept.',
    resetButton: 'Start over…',
    resetConfirm: 'Are you sure you want to delete all your progress?',
    resetCannotUndo: 'This can’t be undone.',
    resetYes: 'Yes, start over',
    cancel: 'Cancel',
    resetDone: 'Progress reset. Welcome back to the beginning!',
  },

  theme: {
    label: 'Theme',
    options: {
      system: 'Match device',
      light: 'Light',
      dark: 'Dark',
    },
  },

  os: {
    compactLabel: 'Instructions:',
    question: 'Which computer do you use?',
    only: (os: string) => `${os} only:`,
  },

  feedback: {
    title: 'Feedback',
    intro: 'Have an idea for improving the site, or found a mistake? Tell us! Every piece of feedback gets read.',
    writeHeading: 'Write your feedback',
    about: (kind, name, link) => (
      <>
        This feedback is about the {{ module: 'topic', topic: 'section', path: 'path' }[kind]} <strong>{name}</strong>.{' '}
        {link('Want to give general feedback instead?')}
      </>
    ),
    topicPage: (name: string) => `Section ${name}`,
    pathPage: (name: string) => `Path ${name}`,
    typeLabel: 'What is your feedback about?',
    textLabel: 'Your feedback',
    hints: {
      idea: 'What could the site have, or what could it do differently? Also tell us how the idea would help you.',
      virhe: 'Which part was wrong or unclear? Copy in the sentence you mean.',
      komento: 'Which command didn’t work, and what happened? Paste in the error message.',
    },
    maxLength: (max: string) => `Up to ${max} characters.`,
    privacy:
      'Don’t include passwords, API keys or other personal information in your feedback. If you paste in an error message, check that it doesn’t show your own name, for example.',
    sendHeading: 'Send your feedback',
    sendIntro:
      'Feedback isn’t sent directly from this page. Choose the option that suits you below: the page opens it pre-filled, and you send your feedback from there.',
    githubText: 'You need a GitHub account. Your feedback is visible to everyone, and you can follow how it progresses.',
    githubButton: 'Continue to GitHub',
    emailHeading: 'Email',
    emailText: 'No account needed. Only the site’s author sees your feedback.',
    emailButton: 'Continue to email',
    emailFallback: (email: string) => (
      <>
        If your email app doesn’t open, send a message to <strong>{email}</strong>.
      </>
    ),
    prompt: (link: Linker) => <>{link('Tell us in your feedback')} what you’d improve.</>,
  },

  unreviewed: {
    label: 'Not reviewed yet',
    compact: 'This path is new, and the site’s author hasn’t gone through it yet. The instructions may contain mistakes.',
    full: (link: Linker) => (
      <>
        Hi, Nuppu here! This path is brand new, and the site’s author hasn’t gone through it yet. The instructions may contain mistakes or
        parts that don’t match the app. If you notice anything odd, {link('let us know')} and help fix the path.
      </>
    ),
  },

  choices: {
    correctHidden: ' (correct)',
    wrongHidden: ' (wrong)',
    correct: 'Correct!',
    wrong: 'Not quite.',
  },

  command: {
    notFound: (id: string) => `Command “${id}” not found.`,
    onlyOn: (os: string) => `This command is only needed on ${os} computers.`,
    copy: 'Copy',
    copied: 'Copied!',
    copyHidden: (command: string) => ` command ${command}`,
    copiedLive: 'Command copied to the clipboard.',
    copyFailedLive: 'Copying didn’t work. Select the command and copy it yourself.',
    copyFailed: 'Copying didn’t work. Select the text and copy it yourself.',
    source: 'Source:',
    unverified: 'not verified',
    verified: (date: string) => `verified ${date}`,
  },

  quiz: {
    notFound: 'Quiz not found.',
    title: 'Quiz',
    intro: 'Choose an answer. You get feedback straight away, and you can try again as many times as you like.',
    passed: 'Quiz passed! All your answers are correct.',
  },

  verify: {
    notFound: (id: string) => `Check “${id}” not found.`,
    title: (tool: string) => `Check: ${tool}`,
    troubleshooting: (title: string) => `Troubleshooting: ${title}`,
  },

  terminal: {
    notFound: (id: string) => `Exercise “${id}” not found.`,
    macShell: 'Terminal (zsh)',
    exercise: (title: string) => `Exercise: ${title}`,
    showHint: 'Show hint',
    osNotChosen: (os: string) => `This exercise is currently in ${os} style. Choose your own operating system from the top bar.`,
    output: 'Terminal output',
    emptyHint: 'Type a command below and press Enter. The command help shows instructions.',
    promptHidden: 'Command, prompt: ',
    run: 'Run',
    alreadyDone: 'You’ve already completed this exercise. You can keep practising as much as you like.',
    restart: 'Restart the exercise',
    nextStep: (
      <>
        {' '}
        Then keep scrolling down: at the bottom of the page, the <strong>Next</strong> button takes you to the next topic.
      </>
    ),
    lastStep: <> Then keep scrolling down: this is the last topic on the path, and the bottom of the page takes you back to the path’s front page.</>,
  },

  mdx: {
    readMore: 'Read more',
    nuppuSays: 'Nuppu says: ',
    tipWarning: 'Note',
    tipInfo: 'Tip',
  },
}
