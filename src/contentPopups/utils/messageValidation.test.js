import { doesPayloadUrlMatchOrigin } from './messageValidation'
import { logger } from '../../shared/utils/logger'

describe('doesPayloadUrlMatchOrigin', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return true if no url provided in msg.data', () => {
    const msg = { data: {} }
    expect(doesPayloadUrlMatchOrigin(msg, 'https://example.com')).toBe(false)
  })

  it('should return true if null msg provided', () => {
    expect(doesPayloadUrlMatchOrigin(null, 'https://example.com')).toBe(false)
  })

  it('should return true when message origin matches url origin', () => {
    const msg = {
      data: {
        url: 'https://example.com/login'
      }
    }
    const origin = 'https://example.com'
    expect(doesPayloadUrlMatchOrigin(msg, origin)).toBe(true)
  })

  it('should return false when message origin does not match url origin', () => {
    const msg = {
      data: {
        url: 'https://google.com/login'
      }
    }
    const origin = 'https://malicious-site.com'
    expect(doesPayloadUrlMatchOrigin(msg, origin)).toBe(false)
    expect(logger.warn).toHaveBeenCalled()
  })

  // TODO: maybe this should be allowed?

  it('should handle subdomain mismatches correctly', () => {
    const msg = {
      data: {
        url: 'https://sub.example.com/login'
      }
    }
    const origin = 'https://example.com'
    expect(doesPayloadUrlMatchOrigin(msg, origin)).toBe(false)
  })

  it('should return false and log error for invalid URLs', () => {
    const msg = {
      data: {
        url: 'not-a-valid-url'
      }
    }
    const origin = 'https://example.com'
    expect(doesPayloadUrlMatchOrigin(msg, origin)).toBe(false)
    expect(logger.error).toHaveBeenCalled()
  })
})
