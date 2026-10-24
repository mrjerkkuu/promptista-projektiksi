import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressProvider, useProgress } from './ProgressContext'
import { STORAGE_KEY } from './schema'

function Probe() {
  const { progress, dispatch, storageAvailable } = useProgress()
  return (
    <div>
      <span data-testid="os">{progress.os ?? 'ei'}</span>
      <span data-testid="available">{String(storageAvailable)}</span>
      <button onClick={() => dispatch({ type: 'setOs', os: 'windows' })}>valitse</button>
    </div>
  )
}

describe('ProgressProvider', () => {
  it('tallentaa muutokset localStorageen', () => {
    render(
      <ProgressProvider>
        <Probe />
      </ProgressProvider>,
    )
    act(() => screen.getByText('valitse').click())
    expect(screen.getByTestId('os')).toHaveTextContent('windows')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).os).toBe('windows')
  })

  it('toimii ilman tallennustilaa', () => {
    render(
      <ProgressProvider storage={null}>
        <Probe />
      </ProgressProvider>,
    )
    expect(screen.getByTestId('available')).toHaveTextContent('false')
    act(() => screen.getByText('valitse').click())
    expect(screen.getByTestId('os')).toHaveTextContent('windows')
  })
})
