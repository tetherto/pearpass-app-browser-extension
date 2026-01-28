import React from 'react'

import { MenuItem } from '../Menu'

/**
 *
 * @param {Object} props
 * @param {Array} props.actions
 * @param {string} props.actions[].name
 * @param {React.ElementType} props.actions[].icon
 * @param {Function} props.actions[].onClick
 *
 */
export const VaultActionsPopupContent = ({ actions }) => {
  const handleMenuItemClick = (e, action) => {
    e.stopPropagation()
    action()
  }

  return (
    <div
      className={`border-grey100-mode1 bg-grey400-mode1 font-inter absolute flex flex-col items-start gap-1 overflow-hidden rounded-xl border p-2 text-xs`}
    >
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <MenuItem
            key={action.name}
            className="text-white-mode1 flex w-full cursor-pointer items-center justify-between break-keep whitespace-nowrap"
            onClick={(e) => handleMenuItemClick(e, action.onClick)}
          >
            <div className="flex items-center gap-1">
              <Icon size="24" />
              {action.name}
            </div>
          </MenuItem>
        )
      })}
    </div>
  )
}
