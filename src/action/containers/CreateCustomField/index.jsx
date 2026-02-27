import { useState } from 'react'

import { t } from '@lingui/core/macro'

import { ButtonFilter } from '../../../shared/components/ButtonFilter'
import { useOutsideClick } from '../../../shared/hooks/useOutsideClick'
import { ArrowDownIcon } from '../../../shared/icons/ArrowDownIcon'
import { ArrowUpIcon } from '../../../shared/icons/ArrowUpIcon'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { PlusIcon } from '../../../shared/icons/PlusIcon'

const OPTIONS = [
  {
    name: 'Comment',
    type: 'note',
    icon: CommonFileIcon
  }
]

/**
 * @param {{
 *  onCreateCustom: (type: string) => void
 * }} props
 */
export const CreateCustomField = ({ onCreateCustom }) => {
  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useOutsideClick({
    onOutsideClick: () => setIsOpen(false)
  })

  const handleSelect = (type) => {
    onCreateCustom(type)
    setIsOpen(false)
  }

  return (
    <div
      ref={wrapperRef}
      className="bg-grey400-mode1 border-grey100-mode1 z-[5] rounded-[10px] border p-[10px]"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="text-white-mode1 font-inter flex w-full cursor-pointer items-center gap-[10px] text-xs font-normal"
      >
        <PlusIcon size="24" />
        <div>{t`Create Custom`}</div>
        <div className="ml-auto flex">
          {isOpen ? <ArrowUpIcon size="24" /> : <ArrowDownIcon size="24" />}
        </div>
      </div>

      {isOpen && (
        <div className="border-grey100-mode1 mt-[10px] flex flex-wrap gap-[17px] border-t pt-[10px] pb-[10px]">
          {OPTIONS.map((option) => (
            <ButtonFilter
              key={option.type}
              variant="secondary"
              startIcon={option.icon}
              onClick={() => handleSelect(option.type)}
            >
              {option.name}
            </ButtonFilter>
          ))}
        </div>
      )}
    </div>
  )
}
