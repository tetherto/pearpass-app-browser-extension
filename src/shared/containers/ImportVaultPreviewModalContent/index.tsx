import { useCallback, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  Button,
  Dialog,
  ListItem,
  Text,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ExpandMore, LockOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useRecords, useVault } from '@tetherto/pearpass-lib-vault'

import { useGlobalLoading } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { RecordItemIcon } from '../RecordItemIcon'

type PreviewRecord = {
  id: string
  type?: string
  isFavorite?: boolean
  data?: {
    title?: string
    username?: string
    email?: string
    websites?: Array<string | { website?: string }>
    [key: string]: unknown
  }
}

function loginWebsiteUrl(record: PreviewRecord): string {
  if (record.type !== 'login') {
    return ''
  }
  const first = record.data?.websites?.[0]
  if (typeof first === 'string') {
    return first
  }
  if (first && typeof first === 'object' && typeof first.website === 'string') {
    return first.website
  }
  return ''
}

function getRecordSubtitle(record: PreviewRecord): string | undefined {
  const d = record.data
  if (!d) {
    return undefined
  }
  if (record.type === 'login') {
    if (typeof d.username === 'string' && d.username) {
      return d.username
    }
    if (typeof d.email === 'string' && d.email) {
      return d.email
    }
    const url = loginWebsiteUrl(record)
    if (url) {
      return url
    }
  }
  return undefined
}

export const ImportVaultPreviewModalContent = () => {
  const { theme } = useTheme()
  const { colors } = theme
  const { closeModal } = useModal()
  const { navigate } = useRouter() as {
    navigate: (
      page: string,
      opts?: {
        params?: Record<string, unknown>
        state?: Record<string, unknown>
      }
    ) => void
  }
  const { data: vaultData } = useVault()
  const [isVaultExpanded, setIsVaultExpanded] = useState(true)

  const { data: records, isLoading } = useRecords({
    shouldSkip: false,
    variables: {
      filters: {
        searchPattern: '',
        type: '',
        folder: '',
        isFavorite: false
      },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  }) as { data: PreviewRecord[] | undefined; isLoading: boolean }

  useGlobalLoading({ isLoading })

  const recordList = useMemo(
    () => (Array.isArray(records) ? records : []),
    [records]
  )

  const hasRecords = recordList.length > 0

  const vaultSubtitle = useMemo(
    () => `${recordList.length} ${t`Items`}`,
    [recordList.length]
  )

  const handleContinue = useCallback(() => {
    navigate('vault', { state: { recordType: 'all' } })
    closeModal()
  }, [navigate, closeModal])

  const vaultName = vaultData?.name ?? vaultData?.id ?? t`Vault`

  const lockIcon = (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{
        width: 32,
        height: 32,
        borderRadius: rawTokens.radius8,
        backgroundColor: colors.colorSurfaceHover
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          filter: `drop-shadow(0 0 3px ${colors.colorPrimary}99)`
        }}
      >
        <LockOutlined width={18} height={18} color={colors.colorPrimary} />
      </span>
    </div>
  )

  const chevron = (
    <div
      style={{
        display: 'inline-flex',
        transition: 'transform 0.15s ease',
        transform: isVaultExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }}
    >
      <ExpandMore width={16} height={16} color={colors.colorTextPrimary} />
    </div>
  )

  return (
    <Dialog
      title={t`Import Vault`}
      onClose={closeModal}
      testID="import-vault-preview-dialog-v2"
      closeButtonTestID="import-vault-preview-close-v2"
      footer={
        <Button
          variant="primary"
          size="small"
          type="button"
          data-testid="import-vault-preview-continue"
          onClick={handleContinue}
        >
          {t`Continue`}
        </Button>
      }
    >
      <div className="flex min-h-0 w-full flex-1 flex-col items-stretch">
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Vault Found`}
        </Text>
        <div
          className="mt-[var(--spacing12)] overflow-hidden"
          style={{
            border: `1px solid ${colors.colorBorderPrimary}`,
            borderRadius: rawTokens.radius8,
            backgroundColor: colors.colorSurfacePrimary
          }}
        >
          <ListItem
            icon={lockIcon}
            title={vaultName}
            subtitle={vaultSubtitle}
            rightElement={hasRecords ? chevron : undefined}
            onClick={
              hasRecords ? () => setIsVaultExpanded((v) => !v) : undefined
            }
            testID="import-vault-preview-toggle"
          />
          {hasRecords && isVaultExpanded && (
            <div className="max-h-[280px] overflow-y-auto">
              <div
                className="m-[var(--spacing12)]"
                style={{
                  border: `1px solid ${colors.colorBorderPrimary}`,
                  borderRadius: rawTokens.radius8
                }}
              >
                {recordList.map((record) => (
                  <ListItem
                    key={record.id}
                    icon={
                      <RecordItemIcon
                        record={{
                          type: record.type ?? '',
                          data: {
                            title: record.data?.title,
                            websites: record.data?.websites?.map((w) =>
                              typeof w === 'string' ? w : (w?.website ?? '')
                            )
                          }
                        }}
                      />
                    }
                    title={record.data?.title ?? record.type ?? ''}
                    subtitle={getRecordSubtitle(record)}
                    showDivider={false}
                    testID={`import-vault-preview-record-${record.id}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
