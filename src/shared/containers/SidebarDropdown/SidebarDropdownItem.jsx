import React from 'react'

import { Menu, MenuContent, MenuTrigger } from '../../components/Menu'
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
}) => (
  <button
    type="button"
    onClick={onItemClick}
    className="bg-grey350-mode1 relative flex w-full cursor-pointer items-center justify-between rounded-[10px] border-none px-2 py-1.5 transition-colors hover:opacity-90"
    style={{ minHeight: '40px' }}
  >
    <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
      {Icon && (
        <div className="flex-shrink-0">
          <Icon size="24" color="white" />
        </div>
      )}
      <span className="font-inter text-white-mode1 block min-w-0 flex-1 truncate text-left text-base font-bold">
        {label}
      </span>
    </div>
    {showMenu && (
      <Menu>
        <MenuTrigger stopPropagation className="flex-shrink-0">
          <KebabMenuIcon size="24" color="white" />
        </MenuTrigger>
        <MenuContent>{menuPopupContent}</MenuContent>
      </Menu>
    )}
  </button>
)
