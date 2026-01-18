/**
 * Encode a Uint8Array as standard Base64 (no URL-safe conversion).
 * Works in extension service workers without Buffer.
 * @param {Uint8Array} uint8Array
 * @returns {string}
 */
export const base64Encode = (uint8Array) => {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

/**
 * Decode a standard Base64 string into a Uint8Array.
 * @param {string} base64String
 * @returns {Uint8Array}
 */
export const base64Decode = (base64String) => {
  let binary
  try {
    binary = atob(base64String)
  } catch (error) {
    throw new Error('InvalidBase64')
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
