import { t } from '@lingui/core/macro'

import { Record } from '../Record'
import { isStartOfLast14DaysGroup, isStartOfLast7DaysGroup } from './utils'

/**
 *
 * @param {Object} props
 * @param {Array} props.records
 * @param {Array} props.selectedRecords
 * @param {Function} props.onRecordClick
 * @param {Function} props.onRecordSelect
 *
 */
export const RecordListContainer = ({
  records,
  selectedRecords,
  onRecordClick,
  onRecordSelect
}) => (
  <div className="flex h-full w-full flex-col gap-1.5 overflow-y-auto">
    {records?.map((record, index) => {
      const isSelected = selectedRecords.includes(record.id)

      const isStartOfLast7Days = isStartOfLast7DaysGroup(record, index, records)

      const isStartOfLast14Days = isStartOfLast14DaysGroup(
        record,
        index,
        records
      )

      return (
        <>
          <span className="text-grey100-mode1 flex-none text-xs font-normal">
            {isStartOfLast7Days
              ? t`Last 7 days`
              : isStartOfLast14Days
                ? t`Last 14 days`
                : ''}
          </span>

          <div className="flex-1 overflow-auto">
            <Record
              key={record.id}
              record={record}
              isSelected={isSelected}
              otpCode={record?.otpPublic?.currentCode ?? null}
              onClick={() => onRecordClick(record.id, isSelected)}
              onSelect={() => onRecordSelect(record.id)}
            />
          </div>
        </>
      )
    })}
  </div>
)
