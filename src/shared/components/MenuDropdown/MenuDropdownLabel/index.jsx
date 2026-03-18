import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

import { ArrowDownIcon } from '../../../../shared/icons/ArrowDownIcon'
import { ArrowUpIcon } from '../../../../shared/icons/ArrowUpIcon'
import { MenuDropdownItem } from '../MenuDrowdownItem'

/**
 * @param {{
 *    isHidden: boolean,
 *    selectedItem?: {name: string, icon?: import('react').ReactNode},
 *    isOpen: boolean,
 *    setIsOpen?: (isOpen: boolean) => void
 *  }} props
 */
export const MenuDropdownLabel = ({
  isHidden,
  selectedItem,
  isOpen,
  setIsOpen
}) => (
  <div
    className={`text-white-mode1 flex flex-none cursor-pointer items-center gap-[7px] text-sm font-medium whitespace-nowrap ${isHidden ? 'pointer-events-none p-1 opacity-0' : ''}`}
    onClick={() => setIsOpen?.(!isOpen)}
  >
    {isOpen ? (
      <ArrowUpIcon color={colors.white.mode1} size="24" />
    ) : (
      <ArrowDownIcon color={colors.white.mode1} size="24" />
    )}
    <MenuDropdownItem item={selectedItem} />
  </div>
)
