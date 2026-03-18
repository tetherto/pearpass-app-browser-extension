import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

import { RECORD_COLOR_BY_TYPE } from '../../../shared/constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../../../shared/constants/recordIconByType'

/**
 *
 * @param {Object} props
 * @param {string} props.type
 * @param {string} props.label
 */
export const BadgeCategory = ({ type, label }) => {
  const StartIcon = RECORD_ICON_BY_TYPE[type]
  const color = RECORD_COLOR_BY_TYPE[type]
  return (
    <div
      className={`text-black-mode1 flex cursor-pointer items-center justify-between gap-1 rounded-[10px] px-2.5 py-1 text-xs`}
      style={{
        backgroundColor: color
      }}
    >
      {!!StartIcon && <StartIcon color={colors.black.mode1} size="24" />}
      <span>{label}</span>
    </div>
  )
}
