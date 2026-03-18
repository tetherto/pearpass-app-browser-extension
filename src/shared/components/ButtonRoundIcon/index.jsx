import React from 'react'
import { createElement } from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

/**
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Content to be displayed inside the button.
 * @param {React.ElementType} [props.startIcon] - Icon component to be rendered at the start of the button.
 * @param {function} [props.onClick] - Click event handler for the button.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - The button type attribute.
 */
export const ButtonRoundIcon = ({
  children,
  startIcon,
  onClick,
  type = 'button'
}) => (
  <button
    onClick={onClick}
    type={type}
    className="bg-black-mode1 border-black-mode1 hover:border-primary400-mode1 flex cursor-pointer items-center justify-center rounded-full border p-1"
  >
    {startIcon &&
      createElement(startIcon, {
        size: '24px',
        color: colors.primary400.mode1
      })}
    {children}
  </button>
)
