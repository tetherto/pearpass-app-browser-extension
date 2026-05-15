import { setPearpassVaultClient } from '@tetherto/pearpass-lib-vault'

import { PearpassVaultClient } from '../vaultClient'
import { platformMessages } from './services/messageBridge'

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

  const platform = await platformMessages.getPlatformInfo()
  const currentDeviceName = platform
    ? `${platform.os} ${platform.arch}`.trim()
    : undefined
  setPearpassVaultClient(client, { currentDeviceName })

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
