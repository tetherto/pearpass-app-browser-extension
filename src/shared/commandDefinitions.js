/**
 * Command definitions for the Pearpass browser extension.
 * This file defines all available commands and their parameter signatures.
 */

// Define all available commands with their parameter extraction logic
export const COMMAND_DEFINITIONS = {
  // Encryption commands
  encryptionInit: { params: [] },
  encryptionGetStatus: { params: [] },
  encryptionGet: { params: ['key'] },
  encryptionAdd: { params: ['key', 'data'] },

  // RateLimiter commands
  resetFailedAttempts: { params: [] },
  recordFailedMasterPassword: { params: [] },
  getMasterPasswordStatus: { params: [] },

  // Vaults commands
  vaultsInit: { params: ['encryptionKey'] },
  vaultsGetStatus: { params: [] },
  vaultsGet: { params: ['key'] },
  vaultsList: { params: ['filterKey'] },
  vaultsAdd: { params: ['key', 'vault'] },
  vaultsClose: { params: [] },

  // Active vault commands
  activeVaultInit: {
    params: ['options'],
    extractParams: (options) => options
  },
  activeVaultGetStatus: { params: [] },
  activeVaultGet: { params: ['key'] },
  activeVaultList: { params: ['filterKey'] },
  activeVaultAdd: { params: ['key', 'data'] },
  activeVaultRemove: { params: ['key'] },
  activeVaultClose: { params: [] },
  activeVaultCreateInvite: { params: [] },
  activeVaultDeleteInvite: { params: [] },
  activeVaultRemoveFile: { params: ['key'] },

  // Password and encryption key commands
  hashPassword: { params: ['password'] },
  encryptVaultKeyWithHashedPassword: { params: ['hashedPassword'] },
  encryptVaultWithKey: { params: ['hashedPassword', 'key'] },
  getDecryptionKey: {
    params: ['options'],
    extractParams: (options) => options
  },
  decryptVaultKey: {
    params: ['options'],
    extractParams: (options) => options
  },

  // Native Messaging secure channel (pairing/handshake)
  nmGetAppIdentity: { params: [] },
  nmBeginHandshake: { params: ['clientHello'] },
  nmFinishHandshake: { params: ['clientFinish'] },
  nmSecureRequest: {
    params: ['payload'],
    extractParams: (payload) => payload
  },
  nmCloseSession: { params: ['sessionId'] },

  // Pairing and misc commands
  pairActiveVault: { params: ['inviteCode'] },
  cancelPairActiveVault: { params: [] },
  initListener: {
    params: ['options'],
    extractParams: (options) => options
  },
  closeAllInstances: { params: [] },

  // Password commands
  initWithPassword: { params: ['password'] }
}

// Export just the command names
export const COMMAND_NAMES = Object.keys(COMMAND_DEFINITIONS)

/**
 * Get parameter mapping for a command
 * @param {string} commandName - The command name
 * @param {Array} args - The arguments passed to the command
 * @returns {Object} The parameters object to send
 */
export const getCommandParams = (commandName, args) => {
  const definition = COMMAND_DEFINITIONS[commandName]
  if (!definition) {
    throw new Error(`Unknown command: ${commandName}`)
  }

  // If there's a custom extractor, use it
  if (definition.extractParams) {
    return definition.extractParams(...args)
  }

  // Otherwise, map arguments to parameter names
  const params = {}
  definition.params.forEach((paramName, index) => {
    if (args[index] !== undefined) {
      params[paramName] = args[index]
    }
  })

  return params
}
