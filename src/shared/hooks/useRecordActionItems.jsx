import React, { useEffect, useRef } from 'react'

import { t } from '@lingui/core/macro'
import { RECORD_TYPES, useRecords } from '@tetherto/pearpass-lib-vault'

import { useCreateOrEditRecord } from '../../action/hooks/useCreateOrEditRecord'
import { useModal } from '../../shared/context/ModalContext'
import { useRouter } from '../../shared/context/RouterContext'
import { isV2 } from '../../shared/utils/designVersion'
import { ConfirmationModalContent } from '../containers/ConfirmationModalContent'
import { DeleteRecordsModalContentV2 } from '../containers/DeleteRecordsModalContentV2'
import { MoveFolderModalContent } from '../containers/MoveFolderModalContent'
import { MoveFolderModalContentV2 } from '../containers/MoveFolderModalContentV2'
import { useToast } from '../context/ToastContext'

/**
 * @param {{
 *  excludeTypes?: Array<string>
 *  record: {
 *    id: string
 *    type?: string
 *    isFavorite?: boolean
 *  }
 *  onSelect?: () => void
 *  onClose?: () => void
 * }}
 *
 * @returns {{
 *  actions: Array<{
 *    name: string,
 *    type: string,
 *    click: () => void
 *  }>
 * }}
 */
export const useRecordActionItems = ({
  excludeTypes = [],
  record,
  onSelect,
  onClose
} = {}) => {
  const { setModal, closeModal } = useModal()
  const { params, navigate, currentPage } = useRouter()
  const {
    deleteRecords,
    updateRecords,
    updateFavoriteState,
    data: records
  } = useRecords()
  const { setToast } = useToast()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const pendingDeleteId = useRef(null)

  // Close modal only if record was successfully deleted
  useEffect(() => {
    if (pendingDeleteId.current && records) {
      const recordStillExists = records.some(
        (r) => r.id === pendingDeleteId.current
      )

      if (!recordStillExists) {
        closeModal()
        pendingDeleteId.current = null
      }
    }
  }, [records?.length, closeModal])

  const handleDeleteConfirm = async () => {
    if (params?.recordId === record?.id) {
      navigate('vault')
    }

    pendingDeleteId.current = record?.id

    try {
      await deleteRecords([record?.id])
      closeModal()
    } catch {
      pendingDeleteId.current = null
    }
  }

  const handleDelete = () => {
    setModal(
      isV2() ? (
        <DeleteRecordsModalContentV2 records={[record]} />
      ) : (
        <ConfirmationModalContent
          title={t`Are you sure to delete this item?`}
          text={t`This is permanent and cannot be undone`}
          primaryLabel={t`No`}
          secondaryLabel={t`Yes`}
          secondaryAction={handleDeleteConfirm}
          primaryAction={closeModal}
        />
      )
    )
    onClose?.()
  }

  const handleFavoriteToggle = () => {
    updateFavoriteState([record?.id], !record?.isFavorite)
    onClose?.()
  }

  const handleSelect = () => {
    onSelect?.(record)
    onClose?.()
  }

  const handleMoveClick = () => {
    setModal(
      isV2() ? (
        <MoveFolderModalContentV2 records={[record]} />
      ) : (
        <MoveFolderModalContent records={[record]} />
      )
    )
    onClose?.()
  }

  const handleEdit = () => {
    handleCreateOrEditRecord({
      recordType: record?.type,
      initialRecord: record,
      source: params?.source
    })
    onClose?.()
  }

  const isAuthenticatorLoginRecord =
    record?.type === RECORD_TYPES.LOGIN &&
    !!record?.otpPublic &&
    (currentPage === 'authenticator' || params?.source === 'authenticator')

  const handleStripOtp = () => {
    setModal(
      <DeleteRecordsModalContentV2
        records={[record]}
        title={t`Remove Authenticator Code`}
        confirmText={t`Are you sure you want to remove the authenticator code from this login record?`}
        submitLabel={t`Remove`}
        onConfirm={async () => {
          const { otpInput, otp, ...restData } = record?.data ?? {}
          const { otpPublic, ...recordWithoutOtp } = record ?? {}
          const updatedRecord = { ...recordWithoutOtp, data: restData }
          try {
            await updateRecords([updatedRecord])
          } catch (err) {
            setToast({
              message: err?.message ?? t`Failed to remove authenticator code`
            })
            throw err
          }
        }}
      />
    )
    onClose?.()
  }

  const defaultActions = [
    {
      name: t`Select element`,
      type: 'select',
      click: handleSelect
    },
    {
      name: record?.isFavorite ? t`Remove from Favorites` : t`Mark as favorite`,
      type: 'favorite',
      click: handleFavoriteToggle
    },
    {
      name: t`Edit`,
      type: 'edit',
      click: handleEdit
    },
    {
      name: t`Move to another folder`,
      type: 'move',
      click: handleMoveClick
    },
    {
      name: t`Delete element`,
      type: 'delete',
      click: isAuthenticatorLoginRecord ? handleStripOtp : handleDelete
    }
  ]

  const handleAutofill = ({ recordType, data }) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return

      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'autofillFromAction',
        recordType,
        data
      })
    })
  }

  const actionsByRecordType = {
    [RECORD_TYPES.LOGIN]: {
      name: t`Autofill`,
      type: 'autofill',
      click: () => {
        handleAutofill({
          recordType: record?.type,
          data: {
            username: record?.data?.username || '',
            password: record?.data?.password || ''
          }
        })

        onClose?.()
      }
    },
    [RECORD_TYPES.IDENTITY]: {
      name: t`Autofill`,
      type: 'autofill',
      click: () => {
        handleAutofill({
          recordType: record?.type,
          data: {
            name: record?.data?.fullName || '',
            email: record?.data?.email || '',
            phoneNumber: record?.data?.phoneNumber || '',
            address: record?.data?.address || '',
            zip: record?.data?.zip || '',
            city: record?.data?.city || '',
            region: record?.data?.region || '',
            country: record?.data?.country || ''
          }
        })

        onClose?.()
      }
    }
  }

  const filteredActions = excludeTypes.length
    ? defaultActions.filter((action) => !excludeTypes.includes(action.type))
    : defaultActions

  return {
    actions: [
      ...filteredActions,
      ...(record?.type && actionsByRecordType[record.type]
        ? [actionsByRecordType[record.type]]
        : [])
    ]
  }
}
