import React from 'react'

import { RECORD_ACTION_ICON_BY_TYPE } from '../../../shared/constants/recordActions'
import { MenuItem } from '../Menu'

/**
 * @param {{
 *  menuItems: Array<{
 *    name: string,
 *    type: string,
 *    click?: () => void
 *  }>,
 *  variant?: 'default' | 'compact',
 *  onClick?: () => void
 * }}
 */
export const RecordActionsPopupContent = ({
  menuItems,
  variant = 'default',
  onClick
}) => {
  const isCompact = variant === 'compact'

  return (
    <div
      className={`border-grey100-mode1 bg-grey400-mode1 font-inter flex min-w-[150px] flex-col items-start overflow-hidden rounded-[10px] border ${isCompact ? 'p-[5px] text-[10px]' : 'p-[4px_8px] text-[14px]'} gap-[4px]`}
    >
      {menuItems.map((item) => {
        const Icon = RECORD_ACTION_ICON_BY_TYPE[item.type]

        return (
          <MenuItem
            key={item.type}
            className={`text-white-mode1 flex w-full cursor-pointer items-center gap-[5px] py-1 break-keep whitespace-nowrap ${item !== menuItems[menuItems.length - 1] ? 'border-grey100-mode1 border-b' : ''} `}
            onClick={(e) => {
              e.stopPropagation()
              if (item.click) {
                item.click()
              } else {
                onClick?.()
              }
            }}
          >
            {Icon && <Icon size="24" />}
            <p>{item.name}</p>
          </MenuItem>
        )
      })}
    </div>
  )
}
