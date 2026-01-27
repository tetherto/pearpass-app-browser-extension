import React from 'react'

import { CheckIcon } from '../../../shared/icons/CheckIcon'
import { MenuContent, MenuItem } from '../Menu'

/**
 * @param {{
 *   menuItems: Array<{
 *     name: string,
 *     type: 'recent' | 'newToOld' | 'oldToNew',
 *     icon: React.ElementType
 *   }>,
 *   onClick: (type: 'recent' | 'newToOld' | 'oldToNew') => void,
 *   onClose: () => void,
 *   selectedType: string
 * }}
 */
export const RecordSortActionsPopupContent = ({
  menuItems,
  onClick,
  selectedType
}) => {
  const handleMenuItemClick = (e, type) => {
    e.stopPropagation()
    onClick(type)
  }

  return (
    <MenuContent>
      <div
        className={`border-grey100-mode1 bg-grey400-mode1 font-inter absolute flex flex-col items-start gap-[3px] overflow-hidden rounded-[10px] border p-[5px] text-[10px]`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <MenuItem
              key={item.name}
              className={`text-white-mode1 flex w-full cursor-pointer items-center justify-between gap-[5px] py-1 break-keep whitespace-nowrap`}
              onClick={(e) => handleMenuItemClick(e, item.type)}
            >
              <div className="flex items-center gap-[5px]">
                <Icon size="24" />
                {item.name}
              </div>
              {selectedType === item.type && <CheckIcon size="24" />}
            </MenuItem>
          )
        })}
      </div>
    </MenuContent>
  )
}
