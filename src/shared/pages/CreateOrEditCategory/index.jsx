import { useMemo } from 'react'

import { RECORD_TYPES, useRecordById } from 'pearpass-lib-vault'

import { CreateOrEditCreditCard } from '../../../action/containers/CreateOrEditCreditCard'
import { CreateOrEditCustom } from '../../../action/containers/CreateOrEditCustom'
import { CreateOrEditIdentity } from '../../../action/containers/CreateOrEditIdentity'
import { CreateOrEditLogin } from '../../../action/containers/CreateOrEditLogin'
import { CreateOrEditNote } from '../../../action/containers/CreateOrEditNote'
import { CreateOrEditPassPhrase } from '../../../action/containers/CreateOrEditPassPhrase'
import { CreateOrEditWifi } from '../../../action/containers/CreateOrEditWifi'
import { CONTENT_MESSAGE_TYPES } from '../../constants/nativeMessaging'
import { useRouter } from '../../context/RouterContext'
import { useIsPasskeyPopup } from '../../hooks/useIsPasskeyPopup'
import { sanitizeCredentialForPage } from '../../utils/sanitizeCredentialForPage'

export const CreateOrEditCategory = () => {
  const { params, state: routerState, navigate } = useRouter()

  const isPasskeyPopup = useIsPasskeyPopup()

  const { data: initialRecord } = useRecordById({
    variables: { id: params?.recordId }
  })

  const { commonProps, recordType } = useMemo(() => {
    const recordType = params?.recordType ?? initialRecord?.type
    const selectedFolder = params?.selectedFolder ?? initialRecord?.folder

    const onSave = (savedRecordId) => {
      if (isPasskeyPopup) {
        if (routerState?.passkeyCredential && routerState?.tabId) {
          chrome.tabs.sendMessage(parseInt(routerState.tabId), {
            type: CONTENT_MESSAGE_TYPES.SAVED_PASSKEY,
            requestId: routerState.requestId,
            recordId: savedRecordId || null,
            credential: sanitizeCredentialForPage(routerState.passkeyCredential)
          })
        }
        window.close()
      } else {
        navigate('vault', {
          params: {},
          state: { recordType: 'all', folder: selectedFolder ?? undefined }
        })
      }
    }

    const onClose = () => {
      if (isPasskeyPopup) {
        navigate('createPasskey', {
          state: {
            serializedPublicKey: routerState?.serializedPublicKey,
            requestId: routerState?.requestId,
            requestOrigin: routerState?.requestOrigin,
            tabId: routerState?.tabId
          }
        })
      } else if (initialRecord && Object.keys(initialRecord).length > 0) {
        navigate('recordDetails', {
          params: { recordId: initialRecord.id },
          state: {}
        })
      } else {
        navigate('vault', {
          params: {},
          state: { recordType: 'all', folder: selectedFolder }
        })
      }
    }

    return {
      commonProps: { initialRecord, selectedFolder, onSave, onClose },
      recordType
    }
  }, [params, initialRecord, isPasskeyPopup, navigate, routerState])

  return (
    <div className="bg-grey500-mode1 flex h-full w-full flex-col items-start gap-3.5 rounded-lg p-5">
      {renderContentByType({
        recordType,
        commonProps
      })}
    </div>
  )
}

const renderContentByType = ({ recordType, commonProps }) => {
  switch (recordType) {
    case RECORD_TYPES.LOGIN:
      return <CreateOrEditLogin {...commonProps} />
    case RECORD_TYPES.CREDIT_CARD:
      return <CreateOrEditCreditCard {...commonProps} />
    case RECORD_TYPES.IDENTITY:
      return <CreateOrEditIdentity {...commonProps} />
    case RECORD_TYPES.NOTE:
      return <CreateOrEditNote {...commonProps} />
    case RECORD_TYPES.WIFI_PASSWORD:
      return <CreateOrEditWifi {...commonProps} />
    case RECORD_TYPES.CUSTOM:
      return <CreateOrEditCustom {...commonProps} />
    case RECORD_TYPES.PASS_PHRASE:
      return <CreateOrEditPassPhrase {...commonProps} />
    default:
      return null
  }
}
