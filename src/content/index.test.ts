import { describe, expect, it } from 'vitest'
import { getModule, getModuleByKey, getPath, paths } from './index'

describe('sisällön lataus', () => {
  it('löytää Claude Code -polun automaattisesti', () => {
    expect(paths.map((p) => p.id)).toContain('claude-code')
  })

  it('numeroi moduulit aihealueittain nollasta alkaen', () => {
    const path = getPath('claude-code')!
    expect(path.topics[0].modules[0].number).toBe('0.1')
    expect(path.topics[1].modules[1].number).toBe('1.2')
  })

  it('jokaisella moduulilla on ladattava tietopaketti', () => {
    for (const m of getPath('claude-code')!.modules) expect(typeof m.load).toBe('function')
  })

  it('hakee moduulin avaimella', () => {
    const m = getModule('claude-code', 'terminaali')!
    expect(getModuleByKey('claude-code/terminaali')).toBe(m)
    expect(m.key).toBe('claude-code/terminaali')
    expect(getModuleByKey('claude-code/olematon')).toBeUndefined()
  })
})
