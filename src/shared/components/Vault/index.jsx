import React from 'react'

import { formatDate } from '@tetherto/pear-apps-utils-date'

import { BrushIcon } from '../../../shared/icons/BrushIcon'
import { DeleteIcon } from '../../../shared/icons/DeleteIcon'
import { LockCircleIcon } from '../../../shared/icons/LockCircleIcon'
import { ShareIcon } from '../../../shared/icons/ShareIcon'

/**
 * @param {{
 *  vault: { name: string, createdAt: string },
 *  onClick: () => void,
 *  onShareClick?: () => void,
 *  onEditClick?: () => void,
 *  onDeleteClick?: () => void,
 * }} props
 */
export const Vault = ({
  vault,
  onClick,
  onShareClick,
  onEditClick,
  onDeleteClick
}) => (
  <div
    className={`border-grey100-mode1 hover:border-primary400-mode1 flex w-full cursor-pointer items-center justify-between rounded-lg border px-[10px] py-[5px]`}
    onClick={onClick}
  >
    <div className="flex items-center gap-2.5">
      <LockCircleIcon size="24" />

      <div className="flex flex-col -space-y-1.5">
        <span className="text-white-mode1 font-inter text-base font-normal">
          {vault.name}
        </span>

        <p className="text-white-mode1 font-inter text-[10px] font-light">
          Created {formatDate(vault.createdAt, 'dd-mm-yyyy', '/')}
        </p>
      </div>
    </div>

    <div
      className="flex items-center gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      {onShareClick && (
        <span onClick={onShareClick}>
          <ShareIcon />
        </span>
      )}

      {onEditClick && (
        <span onClick={onEditClick}>
          <BrushIcon />
        </span>
      )}

      {onDeleteClick && (
        <span onClick={onDeleteClick}>
          <DeleteIcon />
        </span>
      )}
    </div>
  </div>
)
