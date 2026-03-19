import React from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { useCreateFolder, useFolders } from '@tetherto/pearpass-lib-vault'

import { ButtonLittle } from '../../components/ButtonLittle'
import { InputField } from '../../components/InputField'
import { useModal } from '../../context/ModalContext'
import { FolderIcon } from '../../icons/FolderIcon'
import { ModalContent } from '../ModalContent'

/**
 * @param {{
 *  onCreate: (folderName: string) => void
 *  initialValues: {title: string}
 * }} props
 */
export const CreateFolderModalContent = ({ onCreate, initialValues }) => {
  const { closeModal } = useModal()
  const { renameFolder } = useFolders()

  const { createFolder } = useCreateFolder({
    onCompleted: (folderName) => {
      onCreate?.(folderName)
      closeModal()
    }
  })

  const { data } = useFolders()
  const customFolders = Object.values(data?.customFolders ?? {})

  const schema = Validator.object({
    title: Validator.string()
      .required(t`Title is required`)
      .refine((value) => {
        const isDuplicate = customFolders.some(
          (folder) => folder.name === value
        )
        return isDuplicate ? t`Folder already exists` : null
      })
  })

  const { register, handleSubmit } = useForm({
    initialValues: {
      title: initialValues?.title ?? ''
    },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    if (initialValues) {
      await renameFolder(initialValues.title, values.title)
      closeModal()
    } else {
      createFolder(values.title)
    }
  }

  return (
    <ModalContent
      onSubmit={handleSubmit(onSubmit)}
      onClose={closeModal}
      headerChildren={
        <div className="flex justify-end">
          <ButtonLittle startIcon={FolderIcon} type="submit">
            {initialValues ? t`Save` : t`Create folder`}
          </ButtonLittle>
        </div>
      }
    >
      <InputField
        label={t`Title`}
        placeholder={t`Insert folder name`}
        variant="outline"
        autoFocus
        {...register('title')}
      />
    </ModalContent>
  )
}
