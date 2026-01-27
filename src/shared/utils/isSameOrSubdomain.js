/**
 * Checks if two domains are the same or have a valid subdomain relationship.
 * @param {string} a - First domain (potential subdomain)
 * @param {string} b - Second domain (potential parent domain)
 * @returns {boolean} True if domains are the same or 'a' is a subdomain of 'b'
 */
export const isSameOrSubdomain = (a, b) => {
  if (!a || !b) return false
  const normalizedA = a.toLowerCase()
  const normalizedB = b.toLowerCase()
  return normalizedA === normalizedB || normalizedA.endsWith(`.${normalizedB}`)
}
