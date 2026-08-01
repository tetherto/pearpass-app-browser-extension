import type { VaultRecord } from './groupRecordsByTimePeriod'
import { partitionRecommendedRecords } from './partitionRecommendedRecords'

const records: VaultRecord[] = [
  {
    id: 'root-domain-login',
    type: 'login',
    data: { websites: ['https://example.com'] }
  },
  {
    id: 'www-login',
    type: 'login',
    data: { websites: ['https://www.example.com'] }
  },
  {
    id: 'other-domain-login',
    type: 'login',
    data: { websites: ['https://other.example'] }
  },
  {
    id: 'note',
    type: 'note',
    data: { websites: ['https://example.com'] }
  }
]

describe('partitionRecommendedRecords', () => {
  test('recommends matching login records and removes them from the remaining list', () => {
    const result = partitionRecommendedRecords(records, 'https://example.com')

    expect(result.recommendedRecords.map(({ id }) => id)).toEqual([
      'root-domain-login',
      'www-login'
    ])
    expect(result.remainingRecords.map(({ id }) => id)).toEqual([
      'other-domain-login',
      'note'
    ])
  })

  test('recommends a login saved for the parent domain on a subdomain', () => {
    const result = partitionRecommendedRecords(
      records,
      'https://login.example.com'
    )

    expect(result.recommendedRecords.map(({ id }) => id)).toEqual([
      'root-domain-login',
      'www-login'
    ])
  })

  test('does not recommend a login scoped to a subdomain from its parent domain', () => {
    const result = partitionRecommendedRecords(
      [
        {
          id: 'subdomain-login',
          type: 'login',
          data: { websites: ['https://login.example.com'] }
        }
      ],
      'https://example.com'
    )

    expect(result.recommendedRecords).toEqual([])
    expect(result.remainingRecords.map(({ id }) => id)).toEqual([
      'subdomain-login'
    ])
  })

  test('does not recommend records without an active tab URL', () => {
    const result = partitionRecommendedRecords(records)

    expect(result.recommendedRecords).toEqual([])
    expect(result.remainingRecords).toBe(records)
  })
})
