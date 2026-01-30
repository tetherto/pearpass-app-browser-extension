import { isContentScriptEnabled } from './isContentScriptEnabled'
import { getAllowHttpFromStorage } from '../../shared/utils/allowHttpStorage'

jest.mock('../../shared/utils/allowHttpStorage', () => ({
  getAllowHttpFromStorage: jest.fn()
}))

describe('isContentScriptEnabled', () => {
  const originalLocation = window.location

  beforeAll(() => {
    delete window.location
    window.location = { protocol: '' }
  })

  afterAll(() => {
    window.location = originalLocation
  })

  it('should return true when protocol is https: regardless of storage setting', async () => {
    window.location.protocol = 'https:'

    getAllowHttpFromStorage.mockResolvedValue(false)
    expect(await isContentScriptEnabled()).toBe(true)

    getAllowHttpFromStorage.mockResolvedValue(true)
    expect(await isContentScriptEnabled()).toBe(true)
  })

  it('should return true when protocol is http: and allowHttp is enabled in storage', async () => {
    window.location.protocol = 'http:'
    getAllowHttpFromStorage.mockResolvedValue(true)

    const result = await isContentScriptEnabled()
    expect(result).toBe(true)
  })

  it('should return false when protocol is http: and allowHttp is disabled in storage', async () => {
    window.location.protocol = 'http:'
    getAllowHttpFromStorage.mockResolvedValue(false)

    const result = await isContentScriptEnabled()
    expect(result).toBe(false)
  })
})
