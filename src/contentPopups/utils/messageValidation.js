import { logger } from '../../shared/utils/logger'

/**
 * Validates that the origin of the message event matches the origin of the URL provided in the message payload.
 *
 * @param {Object} msg - The message object received from the postMessage event.
 * @param {Object} msg.data - The data payload of the message.
 * @param {string} msg.data.url - The URL of the page sending the message. Required string, but monitored for null values.
 * @param {string} eventOrigin - The `origin` property of the MessageEvent. Expected to be a non-null string.
 * @returns {boolean} Returns `true` if the origins match, otherwise `false`.
 */
export const doesPayloadUrlMatchOrigin = (msg, eventOrigin) => {
  if (!msg?.data?.url) {
    return false
  }

  if (!eventOrigin || eventOrigin === 'null') {
    return false
  }

  try {
    const urlOrigin = new URL(msg.data.url).origin
    if (urlOrigin !== eventOrigin) {
      logger.warn(
        'Security Warning: Event origin does not match payload url origin',
        {
          messageOrigin: eventOrigin,
          urlOrigin: urlOrigin
        }
      )
      return false
    }
    return true
  } catch (error) {
    logger.error('Error validating message origin:', error)
    return false
  }
}
