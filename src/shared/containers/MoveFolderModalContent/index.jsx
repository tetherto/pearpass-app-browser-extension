import { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useFolders, useRecords } from '@tetherto/pearpass-lib-vault'

import { ButtonFolder } from '../../components/ButtonFolder'
import { ButtonSingleInput } from '../../components/ButtonSingleInput'
import { useModal } from '../../context/ModalContext'
import { NewFolderIcon } from '../../icons/NewFolderIcon'
import { sortByName } from '../../utils/sortByName'
import { CreateFolderModalContent } from '../CreateFolderModalContent'
import { ModalContent } from '../ModalContent'

/**
 * @param {{
 *  records: {
 *    id: string
 *    folder?: string
 *  }[]
 *  onCompleted?: () => void
 * }} props
 */
export const MoveFolderModalContent = ({ records, onCompleted }) => {
  const { closeModal, setModal } = useModal()
  const { updateFolder } = useRecords({
    onCompleted: closeModal
  })
  const { data: folders } = useFolders()

  const filteredFolders = useMemo(() => {
    const excludedFolder = records?.length === 1 ? records[0].folder : null
    const customFolders = Object.values(folders?.customFolders ?? {})

    return sortByName(
      customFolders.filter((folder) => folder.name !== excludedFolder)
    )
  }, [folders, records])

  const handleMove = async (folderName) => {
    const recordIds = records.map((record) => record.id)
    await updateFolder(recordIds, folderName)
    onCompleted?.()
  }

  const handleCreateClick = () => {
    setModal(
      <CreateFolderModalContent
        onCreate={(folderData) => handleMove(folderData.folder)}
      />
    )
  }

  return (
    <ModalContent
      onClose={closeModal}
      headerChildren={
        <div className="text-grey100-mode1 font-inter text-[12px] font-normal">
          {t`Select a folder or create a new folder`}
        </div>
      }
    >
      <div className="mb-[15px] flex flex-wrap gap-[15px]">
        {filteredFolders.map((folder) => (
          <ButtonFolder
            key={folder.name}
            onClick={() => handleMove(folder.name)}
          >
            {folder.name}
          </ButtonFolder>
        ))}
      </div>

      <ButtonSingleInput startIcon={NewFolderIcon} onClick={handleCreateClick}>
        {t`Create new folder`}
      </ButtonSingleInput>
    </ModalContent>
  )
}
