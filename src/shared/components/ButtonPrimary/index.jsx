import React from 'react'

import { colors } from 'pearpass-lib-ui-theme-provider'

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {function} props.onClick
 * @param {boolean} [props.disabled]
 * @param {React.ElementType} startIcon
 * @param {string} [props.type='button']
 * @param {string} classname
 */
export const ButtonPrimary = ({
  children,
  onClick,
  disabled,
  startIcon: StartIcon,
  type = 'button',
  className = ''
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type}
    className={`bg-primary400-mode1 border-primary400-mode1 flex cursor-pointer items-center justify-center gap-1 rounded-[10px] border px-[15px] py-[8px] text-[14px] font-semibold ${
      disabled ? 'pointer-events-none opacity-50' : ''
    } ${className}`}
  >
    {StartIcon && <StartIcon size="24" color={colors.black.mode1} />}
    {children}
  </button>
)
