import { useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './DeleteRecordsModalContentV2.styles'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useScrollOverflow } from '../../hooks/useScrollOverflow'
import { getRecordSubtitle } from '../../utils/getRecordSubtitle'
import type { VaultRecord } from '../../utils/groupRecordsByTimePeriod'
import { FADE_GRADIENT_HEIGHT } from '../SidebarV2/SidebarV2.styles'
import { RecordItemIcon } from '../RecordItemIcon'

type DeleteRecordsModalContentV2Props = {
  records: VaultRecord[]
  onCompleted?: () => void
  onConfirm?: () => Promise<void>
  title?: string
  confirmText?: string
  submitLabel?: string
}

export const DeleteRecordsModalContentV2 = ({
  records,
  onCompleted,
  onConfirm,
  title: titleProp,
  confirmText: confirmTextProp,
  submitLabel: submitLabelProp
}: DeleteRecordsModalContentV2Props) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()

  const [confirmLoading, setConfirmLoading] = useState(false)

  const { deleteRecords, isLoading: deleteLoading } = useRecords({
    onCompleted: closeModal
  }) as {
    deleteRecords: (ids: string[]) => Promise<void>
    isLoading: boolean
  }

  const isLoading = deleteLoading || confirmLoading

  const itemsListRef = useRef<HTMLDivElement>(null)
  const hasItemsOverflow = useScrollOverflow(itemsListRef, [records.length])

  const count = records.length
  const isSingle = count === 1

  const dialogTitle =
    titleProp ?? (isSingle ? t`Delete 1 Item` : t`Delete ${count} Items`)
  const confirmText =
    confirmTextProp ??
    (isSingle
      ? t`Are you sure to delete the selected item?`
      : t`Are you sure to delete the selected items?`)
  const selectedLabel = isSingle ? t`Selected Item` : t`Selected Items`
  const submitLabel =
    submitLabelProp ?? (isSingle ? t`Delete Item` : t`Delete Items`)

  const handleDelete = async () => {
    if (!count || isLoading) return
    setIsLoading(true)
    if (onConfirm) {
      setConfirmLoading(true)
      try {
        await onConfirm()
        onCompleted?.()
        closeModal()
      } catch {
        // onConfirm handles user feedback; keep modal open on failure
      } finally {
        setConfirmLoading(false)
        setIsLoading(false)
      }
    } else {
      try {
        await deleteRecords(records.map((r) => r.id))
        onCompleted?.()
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog
      title={dialogTitle}
      onClose={closeModal}
      testID="delete-records-dialog-v2"
      closeButtonTestID="delete-records-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="delete-records-discard-v2"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="destructive"
            size="small"
            type="button"
            disabled={!count || isLoading}
            isLoading={isLoading}
            onClick={handleDelete}
            data-testid="delete-records-submit-v2"
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <div style={styles.itemsListHeader}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {selectedLabel}
          </Text>
        </div>

        {count > 0 && (
          <div style={styles.itemsListWrapper}>
            <div
              ref={itemsListRef}
              style={{
                ...styles.itemsList,
                paddingBottom: hasItemsOverflow ? FADE_GRADIENT_HEIGHT : 0
              }}
            >
              {records.map((record) => {
                const subtitle = getRecordSubtitle(record)
                const titleText = record.data?.title ?? ''
                return (
                  <div key={record.id} style={styles.itemRow}>
                    <RecordItemIcon record={record} size={32} />
                    <div style={styles.itemText}>
                      <Text>{titleText}</Text>
                      {subtitle ? (
                        <Text
                          variant="caption"
                          color={theme.colors.colorTextSecondary}
                        >
                          {subtitle}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
            {hasItemsOverflow ? (
              <div style={styles.fadeGradient} aria-hidden="true" />
            ) : null}
          </div>
        )}

        <div style={styles.confirmText}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {confirmText}
          </Text>
        </div>
      </div>
    </Dialog>
  )
}
