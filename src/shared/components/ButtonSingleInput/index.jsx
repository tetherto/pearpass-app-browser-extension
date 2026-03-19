import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *  children?: import('react').ReactNode
 *  startIcon?: import('react').ElementType
 *  variant?: 'default' | 'bordered'
 *  rounded?: 'default' | 'md'
 *  size?: 'default' | 'sm'
 *  type?: 'button' | 'submit'
 *  onClick: () => void,
 *  disabled?: boolean
 * }} props
 */
export const ButtonSingleInput = ({
  children,
  startIcon: StartIcon,
  type = 'button',
  variant = 'default',
  disabled = false,
  onClick
}) => {
  const baseStyle = `
    inline-flex items-center gap-[7px] font-inter  font-medium cursor-pointer text-primary400-mode1 bg-black-mode1 px-[10px] py-[5px] rounded-[10px] hover:border-primary400-mode1
    ${disabled ? 'pointer-events-none opacity-50' : ''}
  `

  const variantStyle =
    variant === 'bordered'
      ? 'border border-primary400-mode1 '
      : 'border border-black-mode1'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variantStyle}`}
    >
      {StartIcon && <StartIcon size="24px" color={colors.primary400.mode1} />}
      {children}
    </button>
  )
}
