import React, { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useFolders } from 'pearpass-lib-vault'

import { MenuDropdown } from '../../../shared/components/MenuDropdown'
import { FolderIcon } from '../../../shared/icons/FolderIcon'

const NO_FOLDER = 'no-folder'
const ALL = 'all'

/**
 * @param {{
 *  selectedFolder?: {
 *    name: string;
 *    icon?: React.ReactNode;
 *  },
 *  onFolderSelect: (folder: {
 *    name: string;
 *    icon?: React.ReactNode;
 *   }) => void
 *  type?: 'select' | 'filter'
 * }} props
 */
export const FolderDropdown = ({
  selectedFolder,
  onFolderSelect,
  type = 'select'
}) => {
  const { data: folders } = useFolders()

  const customFolders = useMemo(() => {
    const mappedFolders = Object.values(folders?.customFolders ?? {}).map(
      (folder) => ({ name: folder.name, icon: FolderIcon })
    )

    if (selectedFolder) {
      if (type === 'select') {
        mappedFolders.unshift({
          name: t`No Folder`,
          type: NO_FOLDER,
          icon: FolderIcon
        })
      } else {
        mappedFolders.unshift({
          name: t`All Items`,
          type: ALL,
          icon: FolderIcon
        })
      }
    }

    return mappedFolders
  }, [folders, selectedFolder])

  const defaultName = type === 'select' ? t`No Folder` : t`All Items`

  const name = selectedFolder ? selectedFolder : defaultName
  const icon = selectedFolder ? FolderIcon : undefined

  const handleFolderSelect = (folder) => {
    onFolderSelect(folder.type === NO_FOLDER ? undefined : folder)
  }

  return (
    <MenuDropdown
      selectedItem={{ name, icon }}
      onItemSelect={handleFolderSelect}
      items={customFolders}
    />
  )
}
