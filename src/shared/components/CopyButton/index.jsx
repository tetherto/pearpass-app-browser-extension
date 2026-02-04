import React from 'react'

import { t } from '@lingui/core/macro'

import { useToast } from '../../context/ToastContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { CopyIcon } from '../../icons/CopyIcon'

export const CopyButton = ({ value, testId }) => {
  const { setToast } = useToast()

  const { copyToClipboard, isCopyToClipboardEnabled } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t`Copied to clipboard`,
        icon: CopyIcon
      })
    }
  })

  const handleCopy = (e) => {
    e.stopPropagation()
    if (value) {
      copyToClipboard(value)
    }
  }

  if (!isCopyToClipboardEnabled) {
    return null
  }

  return (
    <div
      onClick={handleCopy}
      className="text-grey100-mode1 hover:text-white-mode1 flex cursor-pointer items-center transition-colors"
      data-testid={testId}
    >
      <CopyIcon size="24" />
    </div>
  )
}
