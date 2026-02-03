/**
 * Best-effort secure memory clearing for Uint8Array buffers.
 *
 * SECURITY NOTE: JavaScript/V8 cannot guarantee secure memory clearing.
 * This function may fail to fully clear sensitive data due to:
 *
 * - JIT compiler optimizing away "dead stores" (writes to memory about to be freed)
 * - Garbage collector retaining copies until memory is reused
 * - Internal V8 heap copies created during operations (concat, slice, etc.)
 * - String conversions creating immutable copies that cannot be zeroed
 *
 * This is an inherent platform limitation affecting all browser extensions
 * and JavaScript applications handling cryptographic material.
 *
 * Defense relies on OS-level protections:
 * - Process isolation (other processes cannot read this memory)
 * - ASLR (memory addresses are randomized)
 * - Swap encryption (FileVault, BitLocker, LUKS)
 *
 * References:
 * - W3C WebCrypto security model: https://github.com/w3c/webcrypto/issues/269
 * - MDN Memory Management: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management
 *
 * @param {Uint8Array | null | undefined} buffer - The buffer to zero
 */
export const secureZero = (buffer) => {
  if (!buffer?.fill) return
  try {
    buffer.fill(0)
  } catch {
    // Silently fail - buffer may already be detached or invalid
  }
}
