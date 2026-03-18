import React from 'react'

import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'

import { RecordAvatar } from '../../../shared/components/RecordAvatar'
import { RECORD_COLOR_BY_TYPE } from '../../../shared/constants/recordColorByType'

/**
 * @param {{
 *    websiteDomain?: string
 *    isFavorite?: boolean
 *    folder?: string
 *    type?: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
 *    title?: string
 *    isSelected?: boolean,
 *    onClick?: () => void
 * }} props
 */
export const RecordItem = ({
  websiteDomain,
  title,
  isFavorite,
  type,
  folder,
  isSelected = false,
  onClick
}) => (
  <div
    className="flex min-w-0 flex-1 items-center gap-[10px]"
    onClick={onClick}
  >
    <RecordAvatar
      websiteDomain={websiteDomain}
      initials={generateAvatarInitials(title)}
      isSelected={isSelected}
      isFavorite={isFavorite}
      color={RECORD_COLOR_BY_TYPE[type]}
    />

    <div className="text-white-mode1 font-inter flex min-w-0 flex-col justify-start text-[16px] font-normal">
      <span className="truncate">{title}</span>

      <p className="text-grey100-mode1 truncate text-[12px]">{folder}</p>
    </div>
  </div>
)
