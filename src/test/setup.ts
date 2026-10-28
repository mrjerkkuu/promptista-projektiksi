import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdomin selaimen kieli on englanti. Testit olettavat suomenkielisen kävijän, ellei kieltä valita erikseen.
Object.defineProperty(window.navigator, 'languages', { value: ['fi-FI', 'fi', 'en'], configurable: true })

afterEach(() => {
  cleanup()
  localStorage.clear()
})
