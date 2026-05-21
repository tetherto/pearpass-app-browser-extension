import { formatPasskeyDate } from './formatPasskeyDate'

jest.mock('@tetherto/pear-apps-utils-date', () => ({
  formatDate: jest.fn()
}))

const { formatDate } = require('@tetherto/pear-apps-utils-date')

describe('formatPasskeyDate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null for a falsy timestamp', () => {
    expect(formatPasskeyDate(null)).toBeNull()
    expect(formatPasskeyDate(undefined)).toBeNull()
    expect(formatPasskeyDate(0)).toBeNull()
    expect(formatPasskeyDate('')).toBeNull()
  })

  it('returns formatted string for a valid timestamp', () => {
    formatDate.mockReturnValueOnce('21/05/26').mockReturnValueOnce('14:30')

    expect(formatPasskeyDate(1748000000000)).toBe('Created on 21/05/26, 14:30')
    expect(formatDate).toHaveBeenCalledTimes(2)
    expect(formatDate).toHaveBeenNthCalledWith(
      1,
      1748000000000,
      'dd-mm-yy',
      '/'
    )
    expect(formatDate).toHaveBeenNthCalledWith(2, 1748000000000, 'hh-mi', ':')
  })

  it('returns null when formatDate throws', () => {
    formatDate.mockImplementation(() => {
      throw new Error('invalid date')
    })

    expect(formatPasskeyDate(1748000000000)).toBeNull()
  })
})
