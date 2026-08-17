import { logger } from './logger'
import { LOCAL_STORAGE_KEYS } from '../constants/storage'

/**
 * Reads the id of the vault the user last opened.
 * @returns {string | null} The persisted vault id, or null if unset or unavailable.
 */
export const getLastOpenedVaultId = () => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID)
  } catch (error) {
    logger.error('Failed to read last opened vault id:', error)
    return null
  }
}

/**
 * Persists the id of the vault that just became active so it can be
 * re-opened on the next login/restart. No-ops on falsy ids.
 * @param {string | null | undefined} vaultId - The id of the vault to remember.
 * @returns {void}
 */
export const setLastOpenedVaultId = (vaultId) => {
  if (!vaultId) return

  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID,
      String(vaultId)
    )
  } catch (error) {
    logger.error('Failed to persist last opened vault id:', error)
  }
}
