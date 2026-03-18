import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

import { PlusIcon } from '../../../shared/icons/PlusIcon'
import { XIcon } from '../../../shared/icons/XIcon'

/**
 *
 * @param {{
 *  isOpen: boolean
 *  disabled?: boolean
 *  onClick?: () => void
 * }} props
 */
export const ButtonPlusCreateNew = ({
  isOpen,
  disabled = false,
  onClick = () => {}
}) => {
  const Icon = isOpen ? XIcon : PlusIcon

  return (
    <button
      className={`bg-primary400-mode1 flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[15px] border-none p-[3px] ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon
        size="24"
        color={disabled ? colors.gray.mode1 : colors.black.mode1}
      />
    </button>
  )
}
