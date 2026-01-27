import React, { useState } from 'react'

import { SidebarDropdownItem } from './SidebarDropdownItem'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'

const TRANSITION_DURATION = 250

/**
 * @typedef {{
 *  id: string,
 *  label: string,
 *  icon: React.ComponentType<{ size?: string; color?: string }>,
 *  showMenu?: boolean
 * }} SidebarDropdownItemType
 */

/**
 * @param {{
 *  items: SidebarDropdownItemType[],
 *  selectedItem?: SidebarDropdownItemType | null,
 *  defaultLabel?: string,
 *  onItemClick?: (item: SidebarDropdownItemType) => void,
 *  renderMenuPopupContent?: (item: SidebarDropdownItemType) => React.ReactNode
 * }} props
 */
export const SidebarDropdown = ({
  items = [],
  selectedItem,
  onItemClick,
  isOpen: isOpenProp,
  setIsOpen: setIsOpenProp,
  renderMenuPopupContent
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false)

  const isOpen = isOpenProp ?? isOpenInternal
  const setIsOpen = setIsOpenProp ?? setIsOpenInternal

  const handleItemClick = (item) => {
    onItemClick?.(item)
    setIsOpen(false)
  }

  return (
    <div className="bg-grey400-mode1 w-full rounded-[10px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] px-[10px] py-[9px] transition-colors select-none duration-[${TRANSITION_DURATION}ms] ${
          isOpen
            ? 'border-grey100-mode1 bg-transparent'
            : 'border-grey100-mode1 bg-transparent'
        }`}
        style={{
          minHeight: '42px'
        }}
      >
        <span className="font-inter text-white-mode1 text-base font-bold">
          {selectedItem.label}
        </span>

        <div
          className="flex items-center transition-transform"
          style={{
            transitionDuration: `${TRANSITION_DURATION}ms`,
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
          }}
        >
          <ArrowDownIcon size="20" color="white" />
        </div>
      </button>

      <div
        className="flex w-full flex-col gap-[10px] overflow-x-hidden transition-all"
        style={{
          transitionDuration: `${TRANSITION_DURATION}ms`,
          padding: isOpen ? '10px' : '0 10px',
          maxHeight: isOpen ? '130px' : '0',
          opacity: isOpen ? 1 : 0,
          overflowY: isOpen ? 'auto' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {items
          .filter((item) => item.id !== selectedItem.id)
          .map((item, index) => (
            <div
              key={item.id}
              className="transition-all"
              style={{
                transitionDuration: `${TRANSITION_DURATION}ms`,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
                transitionDelay: isOpen ? `${index * 30}ms` : '0ms'
              }}
            >
              <SidebarDropdownItem
                icon={item.icon}
                menuPopupContent={renderMenuPopupContent?.(item)}
                label={item.label}
                showMenu={item.showMenu !== false}
                onItemClick={() => handleItemClick(item)}
              />
            </div>
          ))}
      </div>
    </div>
  )
}
