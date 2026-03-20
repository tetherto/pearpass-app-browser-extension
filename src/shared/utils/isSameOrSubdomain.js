import { normalizeUrl } from './normalizeUrl'

/**
 * Checks if two domains are the same or have a valid subdomain relationship.
 * @param {string} a - First domain (potential subdomain)
 * @param {string} b - Second domain (potential parent domain)
 * @returns {boolean} True if domains are the same or 'a' is a subdomain of 'b'
 */
const getHostname = (value) => {
  if (!value || typeof value !== 'string') return null

  const normalizedValue = normalizeUrl(value, true)
  if (!normalizedValue) return null

  try {
    return new URL(normalizedValue).hostname.toLowerCase()
  } catch {
    return null
  }
}

export const isSameOrSubdomain = (a, b) => {
  const normalizedA = getHostname(a)
  const normalizedB = getHostname(b)

  if (!normalizedA || !normalizedB) return false

  return normalizedA === normalizedB || normalizedA.endsWith(`.${normalizedB}`)
}
