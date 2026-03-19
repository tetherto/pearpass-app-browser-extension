import React, { useState, useRef } from 'react'

import { CLIPBOARD_CLEAR_TIMEOUT } from '@tetherto/pearpass-lib-constants'

import { MESSAGES } from '../../background/constants'
import { LOCAL_STORAGE_KEYS } from '../constants/storage'
import { isCopyToClipboardEnabled as getIsCopyToClipboardEnabled } from '../utils/isCopyToClipboardEnabled'
import { logger } from '../utils/logger'

const { SCHEDULE_CLIPBOARD_CLEAR } = MESSAGES
/**
 * @param {{
 *  onCopy?: () => void
 * }} props
 * @returns {{
 *  isCopied: boolean,
 *  copyToClipboard: (text: string) => boolean,
 *  handleCopyToClipboardSettingChange: (isEnabled: boolean) => void,
 *  isCopyToClipboardEnabled: boolean
 * }}
 */
export const useCopyToClipboard = ({ onCopy } = {}) => {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef()
  const [isCopyToClipboardEnabled, setIsCopyToClipboardEnabled] = useState(
    getIsCopyToClipboardEnabled()
  )
  const handleCopyToClipboardSettingChange = (isEnabled) => {
    if (!isEnabled) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_ENABLED,
        'false'
      )
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_ENABLED)
    }

    setIsCopyToClipboardEnabled(isEnabled)
  }

  const copyToClipboard = React.useCallback((text) => {
    if (!isCopyToClipboardEnabled) {
      return false
    }

    if (!navigator.clipboard) {
      logger.error('Clipboard API is not available')
      return false
    }

    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true)

        onCopy?.()

        try {
          if (typeof chrome !== 'undefined') {
            chrome?.runtime?.sendMessage?.({
              type: SCHEDULE_CLIPBOARD_CLEAR,
              delayMs: CLIPBOARD_CLEAR_TIMEOUT
            })
          }
        } catch {
          setTimeout(() => {
            navigator?.clipboard?.writeText('')
          }, CLIPBOARD_CLEAR_TIMEOUT)
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000)
      },
      (err) => {
        logger.error('Failed to copy text to clipboard', err)
      }
    )

    return true
  }, [])

  return {
    isCopied,
    copyToClipboard,
    handleCopyToClipboardSettingChange,
    isCopyToClipboardEnabled
  }
}
