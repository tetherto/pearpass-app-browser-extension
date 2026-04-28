import {
  groupRecordsByTimePeriod,
  type VaultRecord
} from './groupRecordsByTimePeriod'

// Anchored on a Wednesday to keep "this week" / "this month" boundaries
// well-separated from "today" / "yesterday".
const NOW = new Date('2026-04-15T12:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000

const buildRecord = (overrides: Partial<VaultRecord>): VaultRecord => ({
  id: 'rec',
  type: 'login',
  data: { title: 'Untitled' },
  ...overrides
})

const sectionKeys = (sections: { key: string }[]) => sections.map((s) => s.key)
const idsByKey = (
  sections: { key: string; data: VaultRecord[] }[],
  key: string
) => sections.find((s) => s.key === key)?.data.map((r) => r.id) ?? []

describe('groupRecordsByTimePeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns an empty array for null/undefined/empty input', () => {
    expect(groupRecordsByTimePeriod(null)).toEqual([])
    expect(groupRecordsByTimePeriod(undefined)).toEqual([])
    expect(groupRecordsByTimePeriod([])).toEqual([])
  })

  describe('alphabetical sort (data.title)', () => {
    it('splits favorites and the rest into two sections', () => {
      const records = [
        buildRecord({ id: 'a', isFavorite: true }),
        buildRecord({ id: 'b' }),
        buildRecord({ id: 'c', isFavorite: true }),
        buildRecord({ id: 'd' })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'data.title' })

      expect(sectionKeys(sections)).toEqual(['favorites', 'all'])
      expect(idsByKey(sections, 'favorites')).toEqual(['a', 'c'])
      expect(idsByKey(sections, 'all')).toEqual(['b', 'd'])
      const favorites = sections.find((s) => s.key === 'favorites')
      expect(favorites?.isFavorites).toBe(true)
    })

    it('omits the favorites section when there are no favorites', () => {
      const records = [buildRecord({ id: 'a' }), buildRecord({ id: 'b' })]

      const sections = groupRecordsByTimePeriod(records, { key: 'data.title' })

      expect(sectionKeys(sections)).toEqual(['all'])
    })

    it('omits the all section when every record is a favorite', () => {
      const records = [
        buildRecord({ id: 'a', isFavorite: true }),
        buildRecord({ id: 'b', isFavorite: true })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'data.title' })

      expect(sectionKeys(sections)).toEqual(['favorites'])
    })
  })

  describe('time-based grouping', () => {
    it('buckets records by updatedAt by default', () => {
      const records = [
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        buildRecord({ id: 'yesterday', updatedAt: NOW - 1 * DAY - 1000 }),
        buildRecord({ id: 'thisWeek', updatedAt: NOW - 5 * DAY }),
        buildRecord({ id: 'thisMonth', updatedAt: NOW - 10 * DAY }),
        buildRecord({ id: 'older', updatedAt: NOW - 60 * DAY })
      ]

      const sections = groupRecordsByTimePeriod(records)

      expect(sectionKeys(sections)).toEqual([
        'today',
        'yesterday',
        'thisWeek',
        'thisMonth',
        'older'
      ])
      expect(idsByKey(sections, 'today')).toEqual(['today'])
      expect(idsByKey(sections, 'yesterday')).toEqual(['yesterday'])
      expect(idsByKey(sections, 'thisWeek')).toEqual(['thisWeek'])
      expect(idsByKey(sections, 'thisMonth')).toEqual(['thisMonth'])
      expect(idsByKey(sections, 'older')).toEqual(['older'])
    })

    it('respects the createdAt sort key', () => {
      const records = [
        buildRecord({
          id: 'r',
          createdAt: NOW - 1 * 60 * 60 * 1000,
          updatedAt: NOW - 60 * DAY
        })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'createdAt' })

      expect(sectionKeys(sections)).toEqual(['today'])
      expect(idsByKey(sections, 'today')).toEqual(['r'])
    })

    it('falls back to updatedAt → createdAt → 0 when the chosen field is missing', () => {
      const records = [
        // createdAt key requested but only updatedAt is present → uses updatedAt.
        buildRecord({ id: 'fellThrough', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        // No timestamps at all → 0 → older bucket.
        buildRecord({ id: 'undated' })
      ]

      const sections = groupRecordsByTimePeriod(records, { key: 'createdAt' })

      expect(idsByKey(sections, 'today')).toEqual(['fellThrough'])
      expect(idsByKey(sections, 'older')).toEqual(['undated'])
    })

    it('puts favorites in their own section ahead of the time buckets and excludes them from time buckets', () => {
      const records = [
        buildRecord({
          id: 'favToday',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000
        }),
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 })
      ]

      const sections = groupRecordsByTimePeriod(records)

      expect(sectionKeys(sections)).toEqual(['favorites', 'today'])
      expect(idsByKey(sections, 'favorites')).toEqual(['favToday'])
      expect(idsByKey(sections, 'today')).toEqual(['today'])
    })

    it('reverses the time sections when direction is asc but keeps favorites first', () => {
      const records = [
        buildRecord({ id: 'older', updatedAt: NOW - 60 * DAY }),
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        buildRecord({
          id: 'fav',
          isFavorite: true,
          updatedAt: NOW - 1 * 60 * 60 * 1000
        })
      ]

      const sections = groupRecordsByTimePeriod(records, {
        key: 'updatedAt',
        direction: 'asc'
      })

      expect(sectionKeys(sections)).toEqual(['favorites', 'older', 'today'])
    })

    it('omits time buckets that have no records', () => {
      const records = [
        buildRecord({ id: 'today', updatedAt: NOW - 1 * 60 * 60 * 1000 }),
        buildRecord({ id: 'older', updatedAt: NOW - 60 * DAY })
      ]

      const sections = groupRecordsByTimePeriod(records)

      expect(sectionKeys(sections)).toEqual(['today', 'older'])
    })
  })
})
