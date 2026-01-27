import React, { useState } from 'react'

import { PopupMenu } from '../../components/PopupMenu'
import { KebabMenuIcon } from '../../icons/KebabMenuIcon'

/**
 * @param {{
 *  icon: React.ComponentType<{ size?: string; color?: string }>,
 *  label: string,
 *  onItemClick?: () => void,
 *  showMenu?: boolean,
 *  menuPopupContent?: React.ReactNode
 * }} props
 */
export const SidebarDropdownItem = ({
  icon: Icon,
  label,
  onItemClick,
  showMenu = true,
  menuPopupContent
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  return (
    <button
      type="button"
      onClick={onItemClick}
      className="bg-grey350-mode1 relative flex w-full cursor-pointer items-center justify-between rounded-[10px] border-none px-2 py-1.5 transition-colors hover:opacity-90"
      style={{ minHeight: '40px' }}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size="24" color="white" />}
        <span className="font-inter text-white-mode1 text-base font-bold">
          {label}
        </span>
      </div>
      {showMenu && (
        <div onClick={(e) => e.stopPropagation()}>
          <PopupMenu
            side="right"
            align="right"
            isOpen={isActionsOpen}
            setIsOpen={setIsActionsOpen}
            content={menuPopupContent}
          >
            <KebabMenuIcon size="24" color="white" />
          </PopupMenu>
        </div>
      )}
    </button>
  )
}
