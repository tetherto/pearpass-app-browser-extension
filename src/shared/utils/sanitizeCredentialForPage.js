/**
 * Sanitizes a passkey credential by removing sensitive fields before sending to web pages.
 * @param {Object|null|undefined} credential - The credential object to sanitize
 * @param {string} [credential._privateKeyBuffer] - Private key buffer (will be removed)
 * @param {string} [credential._userId] - User ID (will be removed)
 * @returns {Object|null|undefined} Sanitized credential safe for page context, or null/undefined if input was null/undefined
 */
export const sanitizeCredentialForPage = (credential) => {
  if (!credential) return credential
  const { _privateKeyBuffer, _userId, ...safeCredential } = credential
  return safeCredential
}
