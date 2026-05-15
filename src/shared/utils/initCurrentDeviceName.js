import { setCurrentDeviceName } from '@tetherto/pearpass-lib-vault'

import { logger } from './logger'
import { platformMessages } from '../services/messageBridge'

/**
 * Resolve OS+arch via the background and store it on the vault lib so
 * addDevice() can use it. Works from every extension context.
 * @returns {Promise<void>}
 */
export const initCurrentDeviceName = async () => {
  try {
    const platform = await platformMessages.getPlatformInfo()
    if (platform?.os) {
      const name = platform.arch
        ? `${platform.os} ${platform.arch}`
        : platform.os
      setCurrentDeviceName(name)
    }
  } catch (err) {
    logger.error('initCurrentDeviceName', 'getPlatformInfo failed:', err)
  }
}
