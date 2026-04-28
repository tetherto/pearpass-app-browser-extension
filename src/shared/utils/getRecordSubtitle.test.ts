import { getRecordSubtitle } from './getRecordSubtitle'

describe('getRecordSubtitle', () => {
  it('returns username when present', () => {
    expect(
      getRecordSubtitle({
        data: { username: 'alex', email: 'a@b.co', name: 'Alex' }
      })
    ).toBe('alex')
  })

  it('falls back to email when username is missing or empty', () => {
    expect(getRecordSubtitle({ data: { username: '', email: 'a@b.co' } })).toBe(
      'a@b.co'
    )
    expect(getRecordSubtitle({ data: { email: 'a@b.co' } })).toBe('a@b.co')
  })

  it('falls back to name then fullName', () => {
    expect(getRecordSubtitle({ data: { name: 'Alex' } })).toBe('Alex')
    expect(getRecordSubtitle({ data: { fullName: 'Alex Kim' } })).toBe(
      'Alex Kim'
    )
  })

  it('returns empty string when no candidates are available', () => {
    expect(getRecordSubtitle({})).toBe('')
    expect(getRecordSubtitle({ data: {} })).toBe('')
  })

  it('ignores non-string values', () => {
    expect(
      getRecordSubtitle({
        data: { username: 42 as unknown as string, email: 'a@b.co' }
      })
    ).toBe('a@b.co')
  })
})
