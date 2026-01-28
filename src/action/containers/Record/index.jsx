import { useState } from 'react'

import { Menu, MenuContent, MenuTrigger } from '../../../shared/components/Menu'
import { RecordActionsPopupContent } from '../../../shared/components/RecordActionsPopupContent'
import { RecordItem } from '../../../shared/components/RecordItem'
import { useRecordActionItems } from '../../../shared/hooks/useRecordActionItems'
import { KebabMenuIcon } from '../../../shared/icons/KebabMenuIcon'

/**
 * @param {{
 *  record: {
 *    id: string
 *    createdAt: number
 *    updatedAt: number
 *    isFavorite: boolean
 *    vaultId: string
 *    folder: string
 *    type: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
 *    data: {
 *      title: string
 *      [key: string]: any
 *    }
 *  },
 *  isSelected: boolean,
 *  onClick: () => void
 *  onSelect: () => void
 * }} props
 */
export const Record = ({ record, isSelected = false, onClick, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)

  const { actions } = useRecordActionItems({
    record,
    onSelect,
    onClose: () => setIsOpen(false)
  })

  const baseBg = isSelected
    ? 'bg-[rgba(134,170,172,0.4)]'
    : isOpen
      ? 'bg-[rgba(134,170,172,0.2)]'
      : 'hover:bg-[rgba(134,170,172,0.2)]'

  const websiteDomain =
    record.type === 'login' ? record?.data?.websites?.[0] : null

  return (
    <div
      onClick={onClick}
      className={`flex min-h-[45px] w-full cursor-pointer items-center justify-between rounded-[10px] px-[10px] py-[5px] ${baseBg}`}
    >
      <RecordItem
        websiteDomain={websiteDomain}
        title={record.data?.title}
        isFavorite={record.isFavorite}
        type={record.type}
        folder={record.folder}
        isSelected={isSelected}
      />

      {!isSelected && (
        <Menu open={isOpen} onOpenChange={setIsOpen}>
          <MenuTrigger stopPropagation>
            <KebabMenuIcon />
          </MenuTrigger>
          <MenuContent>
            <RecordActionsPopupContent menuItems={actions} />
          </MenuContent>
        </Menu>
      )}
    </div>
  )
}
