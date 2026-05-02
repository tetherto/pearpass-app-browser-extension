import { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { RECORD_TYPES, useRecords } from '@tetherto/pearpass-lib-vault'
import {
  Button,
  ListItem,
  Text,
  Title,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Add } from '@tetherto/pearpass-lib-ui-kit/icons'

import { CONTENT_MESSAGE_TYPES } from '../../../shared/constants/nativeMessaging'
import { useRouter } from '../../../shared/context/RouterContext'
import { MESSAGE_TYPES } from '../../../shared/services/messageBridge'
import { getHostname } from '../../../shared/utils/getHostname'
import { logger } from '../../../shared/utils/logger'
import { PasskeyContainerV2 } from '../../containers/PasskeyContainer/PasskeyContainerV2'
import { RecordItemIcon } from '../../../shared/containers/RecordItemIcon'
import { getRecordSubtitle } from '../../../shared/utils/getRecordSubtitle'

type PasskeyRecord = {
  id: string
  type: string
  data?: {
    title?: string
    username?: string
    credential?: unknown
    websites?: string[]
  }
}

export const SelectPasskeyV2 = () => {
  const { state: routerState, navigate } = useRouter()
  const { data: records } = useRecords()
  const { theme } = useTheme()

  const { serializedPublicKey, requestId, requestOrigin, tabId } = routerState

  const handleRecordSelect = (record: PasskeyRecord) => {
    chrome.runtime
      .sendMessage({
        type: MESSAGE_TYPES.GET_ASSERTION_CREDENTIAL,
        serializedPublicKey,
        credential: record.data?.credential,
        requestOrigin
      })
      .then((response) => {
        chrome.tabs.sendMessage(parseInt(tabId), {
          type: CONTENT_MESSAGE_TYPES.GOT_PASSKEY,
          requestId,
          credential: response.assertionCredential
        })
      })
      .catch((error) => {
        logger.error(
          'Failed to get assertion credential:',
          (error as Error)?.message || error
        )
        chrome.tabs.sendMessage(parseInt(tabId), {
          type: CONTENT_MESSAGE_TYPES.GOT_PASSKEY,
          requestId,
          credential: null
        })
      })
      .finally(() => {
        window.close()
      })
  }

  const handleCancel = () => {
    chrome.tabs
      .sendMessage(parseInt(tabId), {
        type: CONTENT_MESSAGE_TYPES.GOT_PASSKEY,
        requestId,
        credential: null
      })
      .finally(() => {
        window.close()
      })
  }

  const handleAddNewLogin = () => {
    chrome.tabs
      .sendMessage(parseInt(tabId), {
        type: CONTENT_MESSAGE_TYPES.GOT_PASSKEY,
        requestId,
        credential: null
      })
      .catch(() => {})
    navigate('createPasskey', { state: routerState })
  }

  const targetHostname = useMemo(() => {
    let rpId: string | undefined
    if (serializedPublicKey) {
      try {
        const parsed = JSON.parse(serializedPublicKey) as {
          rpId?: string
          rp?: { id?: string }
        }
        rpId = parsed?.rpId ?? parsed?.rp?.id
      } catch {
        rpId = undefined
      }
    }
    return getHostname(rpId) || getHostname(requestOrigin)
  }, [serializedPublicKey, requestOrigin])

  const recordsFiltered = useMemo(() => {
    if (!targetHostname) return [] as PasskeyRecord[]
    const stripWww = (h: string) => h.replace(/^www\./i, '')
    const target = stripWww(targetHostname)

    return (records as PasskeyRecord[]).filter((record) => {
      if (record.type !== RECORD_TYPES.LOGIN) return false
      if (!record.data?.credential) return false
      const websites = record.data?.websites ?? []
      return websites.some((w) => {
        const recordHost = getHostname(w)
        if (!recordHost) return false
        const candidate = stripWww(recordHost)
        return (
          candidate === target ||
          candidate.endsWith(`.${target}`) ||
          target.endsWith(`.${candidate}`)
        )
      })
    })
  }, [records, targetHostname])

  const hasRecords = recordsFiltered.length > 0

  return (
    <PasskeyContainerV2 title={t`Use Passkey`} onClose={handleCancel}>
      {hasRecords ? (
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="border-border-primary flex flex-col rounded-[var(--radius16)] border p-[var(--spacing4)]">
            {recordsFiltered.map((record) => (
              <ListItem
                icon={<RecordItemIcon record={record} />}
                iconSize={32}
                title={record.data?.title ?? ''}
                subtitle={getRecordSubtitle(record) || undefined}
                testID={`record-list-item-${record.id}`}
                onClick={() => handleRecordSelect(record)}
                rightElement={
                  <Button
                    variant="tertiary"
                    size="small"
                    data-testid={`passkey-use-btn-${record.id}`}
                    onClick={(e) => {
                      e?.stopPropagation?.()
                      handleRecordSelect(record)
                    }}
                  >
                    {t`Use`}
                  </Button>
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-between gap-[var(--spacing16)]">
          <div className="flex flex-1 flex-col items-center justify-center gap-[var(--spacing8)] text-center">
            <Title as="h2">{t`No Passkey Found`}</Title>
            <Text variant="body" color={theme.colors.colorTextSecondary}>
              {t`No Passkey found for this website. Try using device or hardware key`}
            </Text>
          </div>

          <div className="flex w-full flex-col gap-[var(--spacing8)] pb-[var(--spacing4)]">
            <Button
              variant="primary"
              size="medium"
              data-testid="passkey-add-new-login-btn"
              onClick={handleAddNewLogin}
              iconBefore={<Add />}
            >
              {t`Add New Login`}
            </Button>
            <Button
              variant="secondary"
              size="medium"
              data-testid="passkey-discard-btn"
              onClick={handleCancel}
            >
              {t`Discard`}
            </Button>
          </div>
        </div>
      )}
    </PasskeyContainerV2>
  )
}
