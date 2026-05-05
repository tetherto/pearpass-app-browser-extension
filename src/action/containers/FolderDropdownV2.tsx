import { useEffect, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  Button,
  MultiSlotInput,
  NavbarListItem,
  SelectField,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Close,
  CreateNewFolder,
  Folder,
  KeyboardArrowBottom
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useFolders } from '@tetherto/pearpass-lib-vault'

import { CreateFolderModalContentV2 } from '../../shared/containers/CreateFolderModalContentV2'
import { useModal } from '../../shared/context/ModalContext'
import { sortByName } from '../../shared/utils/sortByName'

type FolderDropdownV2Props = {
  selectedFolder?: string
  onFolderSelect: (name: string) => void
  testIDPrefix?: string
}

export const FolderDropdownV2 = ({
  selectedFolder,
  onFolderSelect,
  testIDPrefix = 'createoredit-folder-v2'
}: FolderDropdownV2Props) => {
  const { theme } = useTheme()
  const { setModal, closeModal } = useModal()
  const { data: folders } = useFolders()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const folderOptions = useMemo(() => {
    return sortByName(
      Object.values(
        (folders?.customFolders ?? {}) as Record<string, { name: string }>
      )
    ).map((f: { name: string }) => f.name)
  }, [folders])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (name: string) => {
    onFolderSelect(name)
    setIsOpen(false)
  }

  const handleCreateFolder = () => {
    setModal(
      <CreateFolderModalContentV2
        onClose={closeModal}
        onCreate={(folderName: string) => {
          onFolderSelect(folderName)
        }}
      />
    )
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen((open) => !open)}
        style={{ cursor: 'pointer', width: '100%' }}
        data-testid={`${testIDPrefix}-trigger`}
      >
        <MultiSlotInput testID={`${testIDPrefix}-slot`}>
          <SelectField
            label={t`Folder`}
            value={selectedFolder ?? ''}
            placeholder={t`Choose Folder`}
            testID={`${testIDPrefix}-select`}
            rightSlot={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: rawTokens.spacing6
                }}
              >
                {selectedFolder && (
                  <Button
                    variant="tertiary"
                    size="small"
                    type="button"
                    aria-label={t`Clear folder`}
                    iconBefore={
                      <Close
                        width={16}
                        height={16}
                        color={theme.colors.colorTextPrimary}
                      />
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderSelect(selectedFolder)
                    }}
                    data-testid={`${testIDPrefix}-clear`}
                  />
                )}
                <KeyboardArrowBottom color={theme.colors.colorTextPrimary} />
              </div>
            }
          />
        </MultiSlotInput>
      </div>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: rawTokens.spacing4,
            backgroundColor: theme.colors.colorSurfacePrimary,
            border: `1px solid ${theme.colors.colorBorderPrimary}`,
            borderRadius: rawTokens.radius8,
            paddingBlock: rawTokens.spacing4,
            paddingInline: rawTokens.spacing4,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.24)',
            zIndex: 1000,
            maxHeight: 240,
            overflowY: 'auto'
          }}
          data-testid={`${testIDPrefix}-menu`}
        >
          {folderOptions.map((name: string) => (
            <NavbarListItem
              key={name}
              icon={
                <Folder
                  width={16}
                  height={16}
                  color={theme.colors.colorTextPrimary}
                />
              }
              iconSize={16}
              label={name}
              selected={selectedFolder === name}
              onClick={() => handleSelect(name)}
              testID={`${testIDPrefix}-option-${name}`}
            />
          ))}
          <NavbarListItem
            icon={
              <CreateNewFolder
                width={16}
                height={16}
                color={theme.colors.colorTextPrimary}
              />
            }
            iconSize={16}
            label={t`Add New Folder`}
            onClick={handleCreateFolder}
            testID={`${testIDPrefix}-create`}
          />
        </div>
      )}
    </div>
  )
}
