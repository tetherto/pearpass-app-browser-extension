
import { isMessageOriginValid } from './messageValidation'

describe('isMessageOriginValid', () => {
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    beforeEach(() => {
        console.warn = jest.fn()
        console.error = jest.fn()
    })

    afterEach(() => {
        console.warn = originalConsoleWarn
        console.error = originalConsoleError
        jest.clearAllMocks()
    })

    it('should return true if no url provided in msg.data', () => {
        const msg = { data: {} }
        expect(isMessageOriginValid(msg, 'https://example.com')).toBe(true)
    })

    it('should return true if null msg provided', () => {
        expect(isMessageOriginValid(null, 'https://example.com')).toBe(true)
    })

    it('should return true when message origin matches url origin', () => {
        const msg = {
            data: {
                url: 'https://example.com/login'
            }
        }
        const origin = 'https://example.com'
        expect(isMessageOriginValid(msg, origin)).toBe(true)
    })

    it('should return false when message origin does not match url origin', () => {
        const msg = {
            data: {
                url: 'https://google.com/login'
            }
        }
        const origin = 'https://malicious-site.com'
        expect(isMessageOriginValid(msg, origin)).toBe(false)
        expect(console.warn).toHaveBeenCalled()
    })

    // TODO: maybe this should be allowed?

    it('should handle subdomain mismatches correctly', () => {
        const msg = {
            data: {
                url: 'https://sub.example.com/login'
            }
        }
        const origin = 'https://example.com'
        expect(isMessageOriginValid(msg, origin)).toBe(false)
    })

    it('should return false and log error for invalid URLs', () => {
        const msg = {
            data: {
                url: 'not-a-valid-url'
            }
        }
        const origin = 'https://example.com'
        expect(isMessageOriginValid(msg, origin)).toBe(false)
        expect(console.error).toHaveBeenCalled()
    })
})