import React from 'react'

import { YellowErrorIcon } from '../../../shared/icons/YellowErrorIcon'

/**
 *
 * @param {Object} props
 * @param {string} props.text
 * @param {boolean} props.withJustifyCenter
 */
export const CardWarning = ({ text, withJustifyCenter = true }) => (
  <div
    className={`text-white-mode1 bg-erroryellow-mode1 border-erroryellow-mode1 flex w-full items-center ${withJustifyCenter ? 'justify-center' : 'none'} gap-2 rounded-[10px] border p-[10px] text-[14px] font-medium`}
    style={{
      backgroundImage:
        'linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8))'
    }}
  >
    <div className="shrink-0">
      <YellowErrorIcon size="14" />
    </div>
    <p>{text}</p>
  </div>
)
