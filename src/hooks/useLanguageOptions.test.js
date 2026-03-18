import { renderHook } from '@testing-library/react'

import { useLanguageOptions } from './useLanguageOptions'

jest.mock('@lingui/core/macro', () => ({
  t: (strs) => strs[0] || strs
}))

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  LANGUAGES: [
    { value: 'en' },
    { value: 'it' },
    { value: 'es' },
    { value: 'fr' }
  ]
}))

describe('useLanguageOptions', () => {
  it('returns language options with correct labels and values', () => {
    const { result } = renderHook(() => useLanguageOptions())
    expect(result.current.languageOptions).toEqual([
      { label: 'English', value: 'en' },
      { label: 'Italian', value: 'it' },
      { label: 'Spanish', value: 'es' },
      { label: 'French', value: 'fr' }
    ])
  })

  it('memoizes the language options', () => {
    const { result, rerender } = renderHook(() => useLanguageOptions())
    const firstResult = result.current.languageOptions
    rerender()
    expect(result.current.languageOptions).toBe(firstResult)
  })
})
