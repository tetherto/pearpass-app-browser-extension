/**
 * Validates the sender of a message to ensure it comes from a trusted source.
 * @param {chrome.runtime.MessageSender} sender - The sender object from Chrome
 * @param {'extension-page' | 'content-script' | 'any'} requiredContext - The required sender context
 * @returns {boolean} - Whether the sender is valid for the required context
 */
export const validateSender = (sender, requiredContext = 'any') => {
  const extensionUrl = chrome.runtime.getURL('')

  switch (requiredContext) {
    case 'extension-page':
      return sender.url?.startsWith(extensionUrl)
    case 'content-script':
      return sender.tab?.id !== undefined
    case 'any':
      return true
    default:
      return false
  }
}
