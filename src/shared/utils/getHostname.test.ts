import { getHostname } from './getHostname'

describe('getHostname', () => {
  test('returns lowercase hostname for plain hostnames', () => {
    expect(getHostname('example.com')).toBe('example.com')
    expect(getHostname('Example.COM')).toBe('example.com')
  })

  test('strips protocol and path', () => {
    expect(getHostname('https://example.com/login')).toBe('example.com')
    expect(getHostname('http://example.com:8080/path?q=1')).toBe('example.com')
  })

  test('keeps subdomains intact', () => {
    expect(getHostname('app.example.com')).toBe('app.example.com')
    expect(getHostname('https://api.app.example.com')).toBe(
      'api.app.example.com'
    )
  })

  test('returns null for empty / nullish input', () => {
    expect(getHostname('')).toBeNull()
    expect(getHostname(null)).toBeNull()
    expect(getHostname(undefined)).toBeNull()
  })

  test('returns null for invalid URLs', () => {
    expect(getHostname('   ')).toBeNull()
    expect(getHostname('://broken')).toBeNull()
  })
})
