import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { isSameOrSubdomain } from './isSameOrSubdomain'
import type { VaultRecord } from './groupRecordsByTimePeriod'

export type RecommendedRecordPartition = {
  recommendedRecords: VaultRecord[]
  remainingRecords: VaultRecord[]
}

export const partitionRecommendedRecords = (
  records: VaultRecord[],
  activeTabUrl?: string | null
): RecommendedRecordPartition => {
  if (!activeTabUrl) {
    return { recommendedRecords: [], remainingRecords: records }
  }

  const recommendedRecords = records.filter(
    (record) =>
      record.type === RECORD_TYPES.LOGIN &&
      record.data?.websites?.some((website) =>
        isSameOrSubdomain(activeTabUrl, website)
      )
  )
  const recommendedIds = new Set(recommendedRecords.map(({ id }) => id))

  return {
    recommendedRecords,
    remainingRecords: records.filter(({ id }) => !recommendedIds.has(id))
  }
}
