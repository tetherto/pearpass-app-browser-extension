import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *  children: React.ReactNode,
 *  variant?: 'primary' | 'secondary',
 *  startIcon?: React.ElementType,
 *  disabled?: boolean,
 *  type?: 'button' | 'submit',
 *  onClick: () => void
 * }} props
 */
export const ButtonFilter = ({
  children,
  startIcon: StartIcon,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick
}) => {
  const handleClick = disabled ? () => {} : onClick

  // const size = variant === 'primary' ? 14 : 21

  const baseClasses = `
    inline-flex items-center gap-2 rounded-[10px] cursor-pointer 
    ${
      variant === 'primary'
        ? 'bg-secondary200-mode1 text-black-mode1 py-1 px-2.5 text-xs'
        : 'bg-grey500-mode1 text-white-mode1 rounded-lg px-3 py-1.5 text-base'
    }
    ${disabled ? 'opacity-50 pointer-events-none' : 'hover:opacity-90'}
    transition-colors duration-150
  `

  return (
    <button type={type} onClick={handleClick} className={baseClasses}>
      {StartIcon && (
        <StartIcon
          size="24"
          color={
            variant === 'primary' ? colors.black.mode1 : colors.white.mode1
          }
        />
      )}
      {children}
    </button>
  )
}
