import { useState } from 'react'

import { plural, t } from '@lingui/core/macro'
import { ListItem, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { ExpandMore, LockOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'

import type { PreviewRecord } from './types'

export type VaultFoundPreviewContentProps = {
  vaultName?: string
  vaultRole?: string
  records: PreviewRecord[]
}

const getSubtitleForRecord = (record: PreviewRecord): string => {
  const data = record.data ?? {}
  if (data.username) return data.username
  if (data.email) return data.email

  const firstWebsite = data.websites?.[0]
  if (typeof firstWebsite === 'string') return firstWebsite
  if (firstWebsite && typeof firstWebsite === 'object') {
    return firstWebsite.website ?? record.type
  }

  return record.type
}

export const VaultFoundPreviewContent = ({
  vaultName,
  vaultRole,
  records
}: VaultFoundPreviewContentProps) => {
  const { theme } = useTheme()
  const { colors } = theme

  const [isExpanded, setIsExpanded] = useState(true)

  const itemCount = records.length
  const countLabel = plural(itemCount, {
    one: '# Item',
    other: '# Items'
  })
  const subtitle = vaultRole ? `${countLabel}  ·  ${vaultRole}` : countLabel

  const hasRecords = itemCount > 0
  const handleToggle = hasRecords
    ? () => setIsExpanded((prev) => !prev)
    : undefined

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <Text variant="caption" color={colors.colorTextSecondary}>
        {t`Vault Found`}
      </Text>
      <div className="border-border-primary flex flex-col gap-[24px] rounded-[8px] border p-[12px]">
        <ListItem
          icon={
            <div className="bg-surface-elevated-on-interaction flex h-[32px] w-[32px] items-center justify-center rounded-[8px]">
              <LockOutlined color={colors.colorPrimary} />
            </div>
          }
          title={vaultName ?? t`Vault`}
          subtitle={subtitle}
          rightElement={
            hasRecords ? (
              <span
                className="inline-flex"
                style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms ease'
                }}
              >
                <ExpandMore color={colors.colorTextPrimary} />
              </span>
            ) : undefined
          }
          onClick={handleToggle}
          testID="import-vault-preview-toggle"
        />
        {isExpanded && hasRecords && (
          <div className="border-border-primary flex flex-col rounded-[8px] border p-[4px]">
            {records.map((record) => (
              <ListItem
                key={record.id}
                title={record.data?.title ?? record.type}
                subtitle={getSubtitleForRecord(record)}
                showDivider={false}
                testID={`import-vault-preview-record-${record.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
