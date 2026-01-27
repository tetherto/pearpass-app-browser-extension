import React, { createElement } from 'react'

import { colors } from 'pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  variant?: 'primary' | 'secondary'
 *  startIcon?: import('react').ElementType
 *  type?: 'button' | 'submit'
 *  onClick: () => void
 *  disabled?: boolean
 *  className?: string
 * }} props
 */
export const ButtonLittle = ({
  children,
  startIcon,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  onClick
}) => {
  const buttonClass =
    variant === 'primary'
      ? 'bg-primary400-mode1 px-2.5 py-1 rounded-[10px] text-black-mode1 hover:bg-primary500-mode1'
      : 'bg-black-mode1 text-primary300-mode1 rounded-[10px] p-1 border border-black-mode1  hover:border-primary400-mode1 hover:text-primary400-mode1 [&_svg_path]:stroke-primary300-mode1 hover:[&_svg_path]:stroke-primary400-mode1'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`peer flex h-fit cursor-pointer items-center gap-2 text-sm font-medium focus:outline-none ${buttonClass} ${
        disabled ? 'pointer-events-none opacity-50' : ''
      } ${className}`}
      disabled={disabled}
    >
      {startIcon &&
        createElement(startIcon, {
          size: '24px',
          color:
            variant === 'primary'
              ? colors.black.mode1
              : colors.primary400.mode1,
          className: 'peer-focus:text-primary500-mode1'
        })}
      {children}
    </button>
  )
}
