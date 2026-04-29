import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  Button,
  ListItem,
  Text,
  Title,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Add } from '@tetherto/pearpass-lib-ui-kit/icons'
import { RECORD_TYPES, useRecords } from '@tetherto/pearpass-lib-vault'

import { CONTENT_MESSAGE_TYPES } from '../../../shared/constants/nativeMessaging'
import { RecordItemIcon } from '../../../shared/containers/RecordItemIcon'
import { ReplacePasskeyModalContent } from '../../../shared/containers/ReplacePasskeyModalContent'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { MESSAGE_TYPES } from '../../../shared/services/messageBridge'
import { getRecordSubtitle } from '../../../shared/utils/getRecordSubtitle'
import { logger } from '../../../shared/utils/logger'
import { normalizeUrl } from '../../../shared/utils/normalizeUrl'
import { PasskeyContainerV2 } from '../../containers/PasskeyContainer/PasskeyContainerV2'

type RecordEntry = {
  id: string
  data?: {
    title?: string
    username?: string
    credential?: unknown
    websites?: string[]
  }
}

export const CreatePasskeyV2 = () => {
  const { state: routerState, navigate } = useRouter()
  const { requestId, tabId, serializedPublicKey, requestOrigin } = routerState
  const { setModal } = useModal()
  const { theme } = useTheme()
  const { data: records } = useRecords()

  const [, setSelectedRecord] = useState<RecordEntry | null>(null)

  const saveToExistingRecord = async (record: RecordEntry | null) => {
    if (!record) return
    try {
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.READY_FOR_PASSKEY_PAYLOAD,
        requestOrigin,
        serializedPublicKey
      })

      const { credential, publicKey } = response

      navigate('createOrEditCategory', {
        params: { recordId: record.id },
        state: {
          inPasskeyFlow: true,
          passkeyCredential: credential,
          passkeyCreatedAt: Date.now(),
          initialData: {
            username: record.data?.username || publicKey.user.name
          },
          serializedPublicKey,
          requestId,
          requestOrigin,
          tabId
        }
      })
    } catch (error) {
      logger.error(
        'Failed to save passkey to existing record:',
        (error as Error)?.message || error
      )
    }
  }

  const handleCreateNewLogin = () => {
    chrome.runtime
      .sendMessage({
        type: MESSAGE_TYPES.READY_FOR_PASSKEY_PAYLOAD,
        requestOrigin,
        serializedPublicKey
      })
      .then((response) => {
        const { credential, publicKey } = response

        navigate('passkeyLoginCreate', {
          state: {
            passkeyCredential: credential,
            passkeyCreatedAt: Date.now(),
            initialData: {
              title: publicKey.rp.name,
              username: publicKey.user.name,
              websites: [normalizeUrl(publicKey.rp.id, true)]
            },
            serializedPublicKey,
            requestId,
            requestOrigin,
            tabId,
            isVerified: routerState?.isVerified ?? true
          }
        })
      })
      .catch((error) => {
        logger.error(
          'Failed to create passkey:',
          (error as Error)?.message || error
        )
      })
  }

  const handleStoreHere = async (record: RecordEntry | null) => {
    if (!record) return

    if (record.data?.credential) {
      setModal(
        <ReplacePasskeyModalContent
          onConfirm={async () => {
            try {
              await saveToExistingRecord(record)
            } catch (error) {
              logger.error(
                'Failed to save passkey:',
                (error as Error)?.message || error
              )
            }
          }}
        />
      )
      return
    }

    await saveToExistingRecord(record)
  }

  const handleCancel = () => {
    chrome.tabs
      .sendMessage(parseInt(tabId), {
        type: CONTENT_MESSAGE_TYPES.SAVED_PASSKEY,
        requestId,
        recordId: null
      })
      .finally(() => {
        window.close()
      })
  }

  const recordsFiltered = useMemo(() => {
    const loginRecords = (records as RecordEntry[]).filter(
      (record) => (record as { type?: string })?.type === RECORD_TYPES.LOGIN
    )

    let publicKeyData: { user?: { name?: string } } | null = null
    if (serializedPublicKey) {
      try {
        publicKeyData = JSON.parse(serializedPublicKey)
      } catch {
        return loginRecords
      }
    }

    if (!publicKeyData) return loginRecords

    const passkeyUsername = publicKeyData.user?.name ?? ''

    return loginRecords.filter((record) => {
      const recordUsername = record?.data?.username ?? ''
      const usernameMatches =
        passkeyUsername && recordUsername
          ? passkeyUsername === recordUsername
          : false
      const hasNoUsername = !recordUsername || recordUsername.trim() === ''
      return usernameMatches || hasNoUsername
    })
  }, [records, serializedPublicKey])

  const hasRecords = recordsFiltered.length > 0

  return (
    <PasskeyContainerV2
      title={t`Save Passkey`}
      onClose={handleCancel}
      onVaultChange={() => setSelectedRecord(null)}
    >
      {hasRecords ? (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col overflow-auto">
            <div className="border-border-primary flex flex-col rounded-[var(--radius16)] border">
              <div className="border-border-primary border-b p-[4px]">
                {recordsFiltered.map((record) => (
                  <ListItem
                    icon={<RecordItemIcon record={record} />}
                    iconSize={32}
                    title={record.data?.title ?? ''}
                    subtitle={getRecordSubtitle(record) || undefined}
                    testID={`record-list-item-${record.id}`}
                    rightElement={
                      <Button
                        variant="tertiary"
                        size="small"
                        data-testid={`passkey-use-btn-${record.id}`}
                        onClick={() => handleStoreHere(record)}
                      >
                        {t`Store here`}
                      </Button>
                    }
                  />
                ))}
              </div>
              <div className="p-[4px]">
                <Button
                  variant="tertiaryAccent"
                  size="small"
                  data-testid="passkey-add-new-login-btn"
                  onClick={handleCreateNewLogin}
                  iconBefore={<Add />}
                >
                  {t`Add New Login Item`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-between gap-[24px]">
          <div className="flex flex-1 flex-col items-center justify-center gap-[6px] text-center">
            <Title as="h2">{t`No Matching Login Found`}</Title>
            <Text color={theme.colors.colorTextSecondary}>
              {t`No matching login found. Add a new login to store this passkey.`}
            </Text>
          </div>

          <div className="flex w-full flex-col gap-[12px]">
            <Button
              variant="primary"
              size="small"
              data-testid="passkey-add-new-login-btn"
              onClick={handleCreateNewLogin}
              iconBefore={<Add />}
            >
              {t`Add New Login`}
            </Button>
            <Button
              variant="secondary"
              size="small"
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
