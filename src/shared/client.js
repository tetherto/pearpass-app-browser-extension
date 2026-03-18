import { setPearpassVaultClient } from '@tetherto/pearpass-lib-vault'

import { PearpassVaultClient } from '../vaultClient'

/**
 * @type {import('../vaultClient/nativeMessaging').NativeMessagingVaultClient}
 */
export let client

/**
 * @returns {import('../vaultClient/nativeMessaging').NativeMessagingVaultClient}
 */
export const createClient = async () => {
  if (client) {
    return client
  }

  // Create native messaging client
  // client = new PearpassVaultClient({
  //   debugMode: MODE === 'development'
  // })
  client = new PearpassVaultClient({
    debugMode: false
  })

  setPearpassVaultClient(client)

  return client
}

/**
 * @returns {import('../vaultClient/nativeMessaging').NativeMessagingVaultClient}
 */
export const getClient = () => {
  if (!client) {
    throw new Error(
      'Pearpass Vault client is not initialized. Call createClient() first.'
    )
  }

  return client
}
