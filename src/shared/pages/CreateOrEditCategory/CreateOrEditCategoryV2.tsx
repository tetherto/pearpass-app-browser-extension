// @ts-expect-error - JS hook is JSDoc-typed
import { useRecordById } from '@tetherto/pearpass-lib-vault'

import { CreateOrEditCategoryWrapper } from '../../../action/containers/Modal/CreateOrEditCategoryWrapper'
import { CONTENT_MESSAGE_TYPES } from '../../constants/nativeMessaging'
import { useRouter } from '../../context/RouterContext'
import { useIsPasskeyPopup } from '../../hooks/useIsPasskeyPopup'
import { sanitizeCredentialForPage } from '../../utils/sanitizeCredentialForPage'

type RouterParams = {
  recordId?: string
  recordType?: string
  selectedFolder?: string
  source?: string
  folder?: string
  isFavorite?: boolean
}

type RouterState = {
  inPasskeyFlow?: boolean
  passkeyCredential?: unknown
  passkeyCreatedAt?: number
  serializedPublicKey?: string
  requestId?: string
  requestOrigin?: string
  tabId?: string
}

type LoadedRecord = {
  id?: string
  type?: string
  folder?: string
  data?: Record<string, unknown>
}

export const CreateOrEditCategoryV2 = () => {
  const { params, state, navigate } = useRouter() as {
    params: RouterParams
    state: RouterState
    navigate: (
      page: string,
      opts?: {
        params?: Record<string, unknown>
        state?: Record<string, unknown>
      }
    ) => void
  }
  const isPasskeyPopup = useIsPasskeyPopup()

  const { data: record } = useRecordById({
    variables: { id: params?.recordId }
  }) as { data?: LoadedRecord }

  if (params?.recordId && !record) {
    return null
  }

  const passkeyCredential = state?.passkeyCredential
  const passkeyCreatedAt = state?.passkeyCreatedAt

  const enrichedInitialRecord = record
    ? ({
        ...record,
        data: {
          ...(record.data ?? {}),
          ...(passkeyCredential
            ? {
                credential: passkeyCredential,
                passkeyCreatedAt: passkeyCreatedAt ?? Date.now()
              }
            : {})
        }
      } as Parameters<typeof CreateOrEditCategoryWrapper>[0]['initialRecord'])
    : undefined

  const recordType = params?.recordType ?? record?.type
  const selectedFolder = params?.selectedFolder ?? record?.folder

  const handleSaved = (savedRecordId?: string) => {
    if (isPasskeyPopup && state?.tabId) {
      chrome.tabs.sendMessage(parseInt(state.tabId), {
        type: CONTENT_MESSAGE_TYPES.SAVED_PASSKEY,
        requestId: state.requestId,
        recordId: savedRecordId ?? null,
        credential: passkeyCredential
          ? sanitizeCredentialForPage(passkeyCredential)
          : null
      })
      window.close()
      return
    }
    if (savedRecordId) {
      navigate('recordDetails', {
        params: { recordId: savedRecordId, source: params?.source }
      })
    } else {
      navigate('vault', {
        params: {},
        state: { recordType: 'all' }
      })
    }
  }

  const handleClose = () => {
    if (isPasskeyPopup) {
      navigate('createPasskey', {
        state: {
          serializedPublicKey: state?.serializedPublicKey,
          requestId: state?.requestId,
          requestOrigin: state?.requestOrigin,
          tabId: state?.tabId
        }
      })
      return
    }
    if (record?.id) {
      navigate('recordDetails', {
        params: { recordId: record.id, source: params?.source }
      })
    } else {
      navigate('vault', {
        params: {},
        state: { recordType: 'all' }
      })
    }
  }

  return (
    <CreateOrEditCategoryWrapper
      recordType={recordType}
      initialRecord={enrichedInitialRecord}
      selectedFolder={selectedFolder}
      isFavorite={params?.isFavorite}
      fullScreen
      onClose={handleClose}
      onSaved={handleSaved}
    />
  )
}
