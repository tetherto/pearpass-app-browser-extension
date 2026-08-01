import { getHostname } from './getHostname'

/**
 * Checks if two domains are the same or have a valid subdomain relationship.
 * @param {string} a - First domain (potential subdomain)
 * @param {string} b - Second domain (potential parent domain)
 * @returns {boolean} True if domains are the same or 'a' is a subdomain of 'b'
 */
export const isSameOrSubdomain = (a, b) => {
  const normalizedA = getHostname(a)?.replace(/^www\./i, '')
  const normalizedB = getHostname(b)?.replace(/^www\./i, '')

  if (!normalizedA || !normalizedB) return false

  return normalizedA === normalizedB || normalizedA.endsWith(`.${normalizedB}`)
}
