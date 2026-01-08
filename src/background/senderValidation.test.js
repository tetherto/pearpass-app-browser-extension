import { validateSender } from './utils/validateSender'

const EXTENSION_ID = 'mcajgeipojjbbmnhidnmohfncdkdoack'
const EXTENSION_URL = `chrome-extension://${EXTENSION_ID}/`

global.chrome = {
  runtime: {
    getURL: (path) => `${EXTENSION_URL}${path}`
  }
}

describe('validateSender', () => {
  describe('extension-page context', () => {
    it('allows messages from own extension pages', () => {
      const sender = { url: `chrome-extension://${EXTENSION_ID}/popup.html` }
      expect(validateSender(sender, 'extension-page')).toBe(true)
    })

    it('blocks messages from other extensions', () => {
      const sender = { url: 'chrome-extension://other-id/popup.html' }
      expect(validateSender(sender, 'extension-page')).toBeFalsy()
    })

    it('blocks messages with undefined url', () => {
      const sender = { url: undefined }
      expect(validateSender(sender, 'extension-page')).toBeFalsy()
    })
  })

  describe('content-script context', () => {
    it('allows messages with valid tab id', () => {
      const sender = { tab: { id: 123 } }
      expect(validateSender(sender, 'content-script')).toBe(true)
    })

    it('blocks messages without tab context', () => {
      const sender = { url: 'chrome-extension://id/popup.html' }
      expect(validateSender(sender, 'content-script')).toBe(false)
    })
  })

  describe('default behavior', () => {
    it('allows any message for "any" context', () => {
      expect(validateSender({}, 'any')).toBe(true)
    })

    it('blocks unknown context types', () => {
      expect(validateSender({}, 'unknown')).toBe(false)
    })
  })
})
