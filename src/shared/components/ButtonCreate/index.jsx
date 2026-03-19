import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *   startIcon?: React.ElementType,
 *   endIcon?: React.ElementType,
 *   children: React.ReactNode,
 *   type?: 'button' | 'submit',
 *   onClick: () => void
 *   disabled?: boolean,
 * }} props
 */
export const ButtonCreate = ({
  startIcon: StartIcon,
  endIcon: EndIcon,
  children,
  type = 'button',
  disabled,
  onClick
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-primary400-mode1 text-black-mode1 border-grey100-mode1 flex cursor-pointer items-center justify-between gap-2 rounded-[10px] border p-2 font-semibold ${disabled ? 'pointer-events-none opacity-50' : ''}`}
  >
    {StartIcon ? <StartIcon color={colors.black.mode1} size="24" /> : <div />}
    {children}
    {EndIcon ? <EndIcon color={colors.black.mode1} size="24" /> : <div />}
  </button>
)
