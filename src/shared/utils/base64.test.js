import { base64Encode, base64Decode } from './base64'

describe('base64Encode', () => {
  it('encodes a Uint8Array to a base64 string', () => {
    const input = new Uint8Array([72, 101, 108, 108, 111])
    expect(base64Encode(input)).toBe(btoa('Hello'))
  })

  it('encodes an empty Uint8Array to an empty string', () => {
    expect(base64Encode(new Uint8Array([]))).toBe('')
  })

  it('produces output that atob can decode back to original bytes', () => {
    const input = new Uint8Array([1, 2, 3, 255, 0, 128])
    const encoded = base64Encode(input)
    const decoded = atob(encoded)
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0))
    expect(bytes).toEqual(input)
  })

  it('handles large arrays spanning multiple chunks', () => {
    const large = new Uint8Array(100000).fill(65)
    const encoded = base64Encode(large)
    expect(encoded).toBe(btoa('A'.repeat(100000)))
  })
})

describe('base64Decode', () => {
  it('decodes a base64 string to a Uint8Array', () => {
    const encoded = btoa('Hello')
    const result = base64Decode(encoded)
    expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]))
  })

  it('decodes an empty base64 string to an empty Uint8Array', () => {
    expect(base64Decode('')).toEqual(new Uint8Array([]))
  })

  it('throws InvalidBase64 for invalid input', () => {
    expect(() => base64Decode('!!!invalid!!!')).toThrow('InvalidBase64')
  })

  it('roundtrips correctly with base64Encode', () => {
    const original = new Uint8Array([10, 20, 30, 40, 50, 200, 250])
    expect(base64Decode(base64Encode(original))).toEqual(original)
  })
})
