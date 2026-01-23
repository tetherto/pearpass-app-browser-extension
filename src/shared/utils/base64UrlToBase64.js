/**
 * Convert a Base64URL string to standard Base64.
 * @param {string} str Base64URL string
 * @returns {string} Base64 string
 */
export const base64UrlToBase64 = (str) => {
  if (!str) return ''
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  base64 += '=='.slice(0, (4 - (base64.length % 4)) % 4)
  return base64
}
