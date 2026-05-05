import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { Button, Dialog, Form, InputField } from '@tetherto/pearpass-lib-ui-kit'
import { useCreateFolder, useFolders } from '@tetherto/pearpass-lib-vault'

import { useLoadingContext } from '../../context/LoadingContext'
import { logger } from '../../utils/logger'

export type CreateFolderModalContentV2Props = {
  onClose: () => void
  onCreate?: (folderName: string) => void
  onRename?: (newFolderName: string, previousFolderName: string) => void
  initialValues?: { title: string }
}

export const CreateFolderModalContentV2 = ({
  onClose,
  onCreate,
  onRename,
  initialValues
}: CreateFolderModalContentV2Props) => {
  const { setIsLoading } = useLoadingContext()
  const isRename = !!initialValues

  const { renameFolder, data } = useFolders()
  const customFolders: Array<{ name: string }> = Object.values(
    data?.customFolders ?? {}
  )

  const [isRenameLoading, setIsRenameLoading] = useState(false)

  const { isLoading: isCreateLoading, createFolder } = useCreateFolder({
    onCompleted: (folderData: { folder: string }) => {
      onCreate?.(folderData.folder)
      onClose()
    }
  })

  const isLoading = isRename ? isRenameLoading : isCreateLoading

  const schema = Validator.object({
    title: Validator.string()
      .required(t`Title is required`)
      .refine((value: string): string | null => {
        const candidate = value.trim()
        if (isRename && candidate === initialValues?.title) {
          return null
        }
        if (customFolders.some((folder) => folder.name === candidate)) {
          return t`Folder already exists`
        }
        return null
      })
  })

  const { register, handleSubmit, setValue } = useForm({
    initialValues: {
      title: initialValues?.title ?? ''
    },
    validate: (formValues: Record<string, string>) =>
      schema.validate(formValues) as Record<string, string>
  })

  const titleField = register('title')

  const onSubmit = async (formValues: Record<string, string>) => {
    if (isLoading) return
    const trimmed = String(formValues.title ?? '').trim()

    if (isRename) {
      try {
        setIsRenameLoading(true)
        setIsLoading(true)
        await renameFolder(initialValues!.title, trimmed)
        onRename?.(trimmed, initialValues!.title)
        onClose()
      } catch (error) {
        logger.error(
          'CreateFolderModalContentV2',
          'Error renaming folder:',
          error
        )
      } finally {
        setIsRenameLoading(false)
        setIsLoading(false)
      }
    } else {
      createFolder(trimmed)
    }
  }

  const runSubmit = handleSubmit(onSubmit)

  const isSaveDisabled = !String(titleField.value ?? '').trim() || isLoading

  return (
    <Dialog
      title={isRename ? t`Rename Folder` : t`Create New Folder`}
      onClose={onClose}
      testID="createfolder-dialog-v2"
      closeButtonTestID="createfolder-close-v2"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={onClose}
            data-testid="createfolder-discard-v2"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isSaveDisabled}
            isLoading={isLoading}
            onClick={() => {
              void runSubmit()
            }}
            data-testid="createfolder-save-v2"
          >
            {isRename ? t`Save` : t`Create New Folder`}
          </Button>
        </div>
      }
    >
      <Form testID="createfolder-form-v2">
        <InputField
          label={t`Folder Name`}
          placeholder={t`Enter Name`}
          value={String(titleField.value ?? '')}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue('title', e.target.value)
          }
          error={titleField.error ? String(titleField.error) : undefined}
          testID="createfolder-name-v2"
        />
      </Form>
    </Dialog>
  )
}
