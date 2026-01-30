import { isSameOrSubdomain } from './isSameOrSubdomain'

describe('isSameOrSubdomain', () => {
  test('should return true for exact domain match', () => {
    expect(isSameOrSubdomain('example.com', 'example.com')).toBe(true)
  })

  test('should return true for exact domain match with different casing', () => {
    expect(isSameOrSubdomain('Example.COM', 'example.com')).toBe(true)
    expect(isSameOrSubdomain('example.com', 'EXAMPLE.COM')).toBe(true)
  })

  test('should return true for valid subdomain', () => {
    expect(isSameOrSubdomain('app.example.com', 'example.com')).toBe(true)
    expect(isSameOrSubdomain('api.app.example.com', 'example.com')).toBe(true)
    expect(isSameOrSubdomain('sub.domain.example.com', 'example.com')).toBe(
      true
    )
  })

  test('should return true for valid subdomain with different casing', () => {
    expect(isSameOrSubdomain('App.Example.COM', 'example.com')).toBe(true)
    expect(isSameOrSubdomain('api.example.com', 'EXAMPLE.COM')).toBe(true)
  })

  test('should return false for malicious domain containing target', () => {
    expect(isSameOrSubdomain('evil-example.com', 'example.com')).toBe(false)
    expect(isSameOrSubdomain('notexample.com', 'example.com')).toBe(false)
    expect(isSameOrSubdomain('examplexcom.com', 'example.com')).toBe(false)
  })

  test('should return false for different domains', () => {
    expect(isSameOrSubdomain('different.com', 'example.com')).toBe(false)
    expect(isSameOrSubdomain('google.com', 'example.com')).toBe(false)
  })

  test('should return false for parent domain (not a subdomain)', () => {
    expect(isSameOrSubdomain('example.com', 'app.example.com')).toBe(false)
  })

  test('should return false when first parameter is empty', () => {
    expect(isSameOrSubdomain('', 'example.com')).toBe(false)
    expect(isSameOrSubdomain(null, 'example.com')).toBe(false)
    expect(isSameOrSubdomain(undefined, 'example.com')).toBe(false)
  })

  test('should return false when second parameter is empty', () => {
    expect(isSameOrSubdomain('example.com', '')).toBe(false)
    expect(isSameOrSubdomain('example.com', null)).toBe(false)
    expect(isSameOrSubdomain('example.com', undefined)).toBe(false)
  })

  test('should return false when both parameters are empty', () => {
    expect(isSameOrSubdomain('', '')).toBe(false)
    expect(isSameOrSubdomain(null, null)).toBe(false)
    expect(isSameOrSubdomain(undefined, undefined)).toBe(false)
  })

  test('should handle domains with different TLDs correctly', () => {
    expect(isSameOrSubdomain('example.co.uk', 'example.com')).toBe(false)
    expect(isSameOrSubdomain('app.example.co.uk', 'example.com')).toBe(false)
  })

  test('should handle single-character subdomains', () => {
    expect(isSameOrSubdomain('a.example.com', 'example.com')).toBe(true)
  })
})
