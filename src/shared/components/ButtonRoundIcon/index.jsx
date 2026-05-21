import React, { createElement } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

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
}) => {
  const { theme } = useTheme()

  return (
    <button
      onClick={onClick}
      type={type}
      className="bg-black-mode1 border-black-mode1 hover:border-primary400-mode1 flex cursor-pointer items-center justify-center rounded-full border p-1"
    >
      {startIcon &&
        createElement(startIcon, {
          size: '24px',
          color: theme.colors.colorPrimary
        })}
      {children}
    </button>
  )
}
