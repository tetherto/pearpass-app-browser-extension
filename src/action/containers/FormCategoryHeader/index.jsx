import { Trans } from '@lingui/react/macro'

import { ButtonLittle } from '../../../shared/components/ButtonLittle'
import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { MenuDropdown } from '../../../shared/components/MenuDropdown'
import { useRouter } from '../../../shared/context/RouterContext'
import { useIsPasskeyPopup } from '../../../shared/hooks/useIsPasskeyPopup'
import { useRecordMenuItems } from '../../../shared/hooks/useRecordMenuItems'
import { SaveIcon } from '../../../shared/icons/SaveIcon'
import { XIcon } from '../../../shared/icons/XIcon'
import { FolderDropdown } from '../FolderDropDown'

/**
 *
 * @param {Object} props
 * @param {Function} props.onSave
 * @param {Function} props.onFolderChange
 * @param {string} props.selectedFolder
 * @param {string} props.selectedCategoryType
 * @param {Object} [props.initialRecord]
 * @param {boolean} [props.isSaveDisabled=false]
 */
export const FormCategoryHeader = ({
  onSave,
  onClose,
  onFolderChange,
  selectedFolder,
  selectedCategoryType,
  initialRecord,
  isSaveDisabled = false
}) => {
  const { currentPage, navigate } = useRouter()
  const { defaultItems } = useRecordMenuItems()
  const isPasskeyPopup = useIsPasskeyPopup()

  const selectedType = defaultItems.filter(
    (item) => item.type === selectedCategoryType
  )?.[0]

  const canSwitchType = !isPasskeyPopup && !initialRecord

  return (
    <div className="relative z-50 flex w-full items-center justify-between">
      <div className="flex items-center gap-2.5">
        <FolderDropdown
          selectedFolder={selectedFolder}
          onFolderSelect={onFolderChange}
        />
        {canSwitchType && (
          <MenuDropdown
            selectedItem={selectedType}
            items={defaultItems}
            onItemSelect={(item) =>
              navigate(currentPage, {
                params: { recordType: item.type }
              })
            }
          />
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <ButtonLittle
          onClick={onSave}
          startIcon={SaveIcon}
          disabled={isSaveDisabled}
        >
          <Trans>Save</Trans>
        </ButtonLittle>

        <ButtonRoundIcon onClick={onClose} startIcon={XIcon} />
      </div>
    </div>
  )
}
