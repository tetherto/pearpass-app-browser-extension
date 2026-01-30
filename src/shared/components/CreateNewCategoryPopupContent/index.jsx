import React from 'react'

import { RECORD_COLOR_BY_TYPE } from '../../../shared/constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../../../shared/constants/recordIconByType'
import { MenuContent, MenuItem } from '../Menu'

/**
 * @param {{
 *   menuItems: Array<{ type: string, name: string }>,
 *   onClick: (item: any) => void,
 * }} props
 */
export const CreateNewCategoryPopupContent = ({ menuItems, onClick }) => {
  const handleMenuItemClick = (e, item) => {
    e.stopPropagation()
    onClick(item)
  }

  return (
    <MenuContent>
      <div className="font-inter flex w-[200px] flex-col items-start overflow-hidden rounded-xl">
        {menuItems?.map((item, index) => {
          const Icon = RECORD_ICON_BY_TYPE?.[item.type]
          const color = RECORD_COLOR_BY_TYPE?.[item.type]
          const isFirst = index === 0
          const isLast = index === menuItems.length - 1

          return (
            <MenuItem
              key={item.type}
              onClick={(e) => handleMenuItemClick(e, item)}
              className={`text-white-mode1 bg-grey400-mode1 border-grey100-mode1 relative flex w-full cursor-pointer items-center gap-[7px] border border-b-0 px-2.5 py-1 ${isFirst && 'rounded-t-xl'} ${isLast && 'rounded-b-xl !border-b'}`}
            >
              {Icon && <Icon size="24" fill={true} color={color} />}
              {item.name}
            </MenuItem>
          )
        })}
      </div>
    </MenuContent>
  )
}
