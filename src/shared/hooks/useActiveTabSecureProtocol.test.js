import { renderHook } from '@testing-library/react'

import { useActiveTabSecureProtocol } from './useActiveTabSecureProtocol'
import { useActiveTabUrl } from './useActiveTabUrl'

jest.mock('./useActiveTabUrl', () => ({
  useActiveTabUrl: jest.fn()
}))

describe('useActiveTabSecureProtocol', () => {
  it('should return isSecure true when URL protocol is https:', () => {
    useActiveTabUrl.mockReturnValue({ url: 'https://example.com' })
    const { result } = renderHook(() => useActiveTabSecureProtocol())

    expect(result.current.isSecure).toBe(true)
    expect(result.current.currentUrl).toBe('https://example.com')
  })

  it('should return isSecure false when URL protocol is http:', () => {
    useActiveTabUrl.mockReturnValue({ url: 'http://example.com' })
    const { result } = renderHook(() => useActiveTabSecureProtocol())

    expect(result.current.isSecure).toBe(false)
    expect(result.current.currentUrl).toBe('http://example.com')
  })

  it('should return isSecure true when currentUrl is missing (loading state)', () => {
    useActiveTabUrl.mockReturnValue({ url: null })
    const { result } = renderHook(() => useActiveTabSecureProtocol())

    expect(result.current.isSecure).toBe(true)
    expect(result.current.currentUrl).toBe(null)
  })

  it('should return isSecure false when URL is invalid', () => {
    useActiveTabUrl.mockReturnValue({ url: 'not-a-url' })
    const { result } = renderHook(() => useActiveTabSecureProtocol())

    expect(result.current.isSecure).toBe(false)
    expect(result.current.currentUrl).toBe('not-a-url')
  })

  it('should update isSecure when URL changes', () => {
    useActiveTabUrl.mockReturnValue({ url: 'https://example.com' })
    const { result, rerender } = renderHook(() => useActiveTabSecureProtocol())

    expect(result.current.isSecure).toBe(true)

    useActiveTabUrl.mockReturnValue({ url: 'http://example.com' })
    rerender()

    expect(result.current.isSecure).toBe(false)
  })
})
