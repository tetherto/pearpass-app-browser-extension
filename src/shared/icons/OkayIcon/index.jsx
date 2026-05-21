import React from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { getIconProps } from '../../../shared/utils/getIconProps'

/**
 * @param {{
 *  size?: string;
 *  width?: string;
 *  height?: string;
 *  color?: string;
 * }} props
 */
export const OkayIcon = (props) => {
  const { theme } = useTheme()
  const { width, height } = getIconProps(props)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        fill={theme.colors.colorPrimary}
        stroke={theme.colors.colorPrimary}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.311 16.1445L6.38184 12.2154L7.36412 11.2331L10.311 14.18L16.6355 7.85547L17.6177 8.83775L10.311 16.1445Z"
        fill={theme.colors.colorTextTertiary}
      />
    </svg>
  )
}
