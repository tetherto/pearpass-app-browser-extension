import { isOnline } from './isOnline'

describe('isOnline', () => {
  const defineOnLine = (value: boolean) =>
    Object.defineProperty(navigator, 'onLine', {
      value,
      writable: true,
      configurable: true
    })

  afterEach(() => {
    defineOnLine(true)
  })

  it('returns true when navigator.onLine is true', () => {
    defineOnLine(true)
    expect(isOnline()).toBe(true)
  })

  it('returns false when navigator.onLine is false', () => {
    defineOnLine(false)
    expect(isOnline()).toBe(false)
  })
})
