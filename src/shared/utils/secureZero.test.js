import { secureZero } from './secureZero'

describe('secureZero', () => {
  it('zeros a Uint8Array buffer', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5])
    secureZero(buffer)
    expect(Array.from(buffer)).toEqual([0, 0, 0, 0, 0])
  })

  it('handles null gracefully', () => {
    expect(() => secureZero(null)).not.toThrow()
  })

  it('handles undefined gracefully', () => {
    expect(() => secureZero(undefined)).not.toThrow()
  })

  it('handles objects without fill method', () => {
    expect(() => secureZero({})).not.toThrow()
    expect(() => secureZero({ length: 5 })).not.toThrow()
  })

  it('handles empty buffer', () => {
    const buffer = new Uint8Array(0)
    expect(() => secureZero(buffer)).not.toThrow()
  })
})
