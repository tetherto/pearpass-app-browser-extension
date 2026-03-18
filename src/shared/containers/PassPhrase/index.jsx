import React, { useState, useEffect } from 'react'

import { t } from '@lingui/core/macro'
import {
  PASSPHRASE_WORD_COUNTS,
  VALID_WORD_COUNTS,
  DEFAULT_SELECTED_TYPE
} from '@tetherto/pearpass-lib-constants'
import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

import { PassPhraseSettings } from './PassPhraseSettings'
import { BadgeTextItem } from '../../components/BadgeTextItem'
import { useToast } from '../../context/ToastContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { usePasteFromClipboard } from '../../hooks/usePasteFromClipboard'
import { CopyIcon } from '../../icons/CopyIcon'
import { ErrorIcon } from '../../icons/ErrorIcon'
import { PassPhraseIcon } from '../../icons/PassPhraseIcon'
import { PasteIcon } from '../../icons/PasteIcon'

/**
 * @param {{
 *  isCreateOrEdit: boolean,
 *  onChange: (value: string) => void,
 *  value: string,
 *  error: string
 * }} props
 */

export const PassPhrase = ({ isCreateOrEdit, onChange, value, error }) => {
  const { setToast } = useToast()
  const [selectedType, setSelectedType] = useState(DEFAULT_SELECTED_TYPE)
  const [withRandomWord, setWithRandomWord] = useState(false)
  const [passphraseWords, setPassphraseWords] = useState([])
  const { pasteFromClipboard } = usePasteFromClipboard()
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t`Copied to clipboard!`,
        icon: CopyIcon
      })
    }
  })

  const parsePassphraseText = (text) =>
    text
      .trim()
      .split(/[-\s]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0)

  const detectAndUpdateSettings = (words) => {
    const wordCount = words.length
    if (
      wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_12 ||
      wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_12
    ) {
      setSelectedType(PASSPHRASE_WORD_COUNTS.STANDARD_12)
      setWithRandomWord(wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_12)
    } else if (
      wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_24 ||
      wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_24
    ) {
      setSelectedType(PASSPHRASE_WORD_COUNTS.STANDARD_24)
      setWithRandomWord(wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_24)
    }
  }

  const isValidRange = (wordCount) =>
    !wordCount || VALID_WORD_COUNTS.includes(wordCount)

  const handlePasteFromClipboard = async () => {
    const pastedText = await pasteFromClipboard()

    if (pastedText) {
      const words = parsePassphraseText(pastedText)
      if (!isValidRange(words.length)) {
        setToast({
          message: t('Only 12 or 24 words are allowed'),
          icon: ErrorIcon
        })
        return
      }
      setPassphraseWords(words)
      detectAndUpdateSettings(words)
      if (onChange) {
        onChange(pastedText)
      }
    }
  }

  useEffect(() => {
    if (value) {
      const words = parsePassphraseText(value)
      setPassphraseWords(words)
      detectAndUpdateSettings(words)
    }
  }, [value])

  const isCreateOrEditWithValidRange =
    isCreateOrEdit && isValidRange(passphraseWords.length)

  return (
    <div className="bg-grey400-mode1 border-grey100-mode1 flex flex-col gap-5 rounded-[10px] border p-[10px]">
      <div className="flex flex-row items-center gap-[10px]">
        <PassPhraseIcon />
        <span className="text-white-mode1 text-[12px] font-normal">{t`Recovery phrase`}</span>
      </div>
      <div className="flex flex-row flex-wrap justify-around gap-x-[5px] gap-y-[15px]">
        {passphraseWords.map((word, i) => (
          <BadgeTextItem key={`${word}-${i}`} count={i + 1} word={word || ''} />
        ))}
      </div>
      <button
        type="button"
        className={`text-primary400-mode1 flex cursor-pointer flex-row items-center justify-center border-0 bg-transparent ${
          isCreateOrEdit ? 'gap-[15px]' : 'gap-[10px]'
        } ${!isCreateOrEditWithValidRange ? 'mb-[15px]' : ''}`}
        onClick={
          isCreateOrEdit
            ? handlePasteFromClipboard
            : () => copyToClipboard(value)
        }
      >
        {isCreateOrEdit ? (
          <>
            <PasteIcon color={colors.primary400?.mode1} />
            <span className="text-primary400-mode1 inline-flex text-center text-[14px]">{t`Paste from clipboard`}</span>
          </>
        ) : (
          <>
            <CopyIcon color={colors.primary400?.mode1} />
            <span className="text-primary400-mode1 inline-flex text-center text-[14px]">{t`Copy`}</span>
          </>
        )}
      </button>
      {isCreateOrEditWithValidRange && (
        <PassPhraseSettings
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          withRandomWord={withRandomWord}
          setWithRandomWord={setWithRandomWord}
          isDisabled={!!passphraseWords.length}
        />
      )}

      {!!error?.length && (
        <div className="flex flex-row items-center gap-[5px]">
          <ErrorIcon size="10" />
          <span className="text-categoryIdentity-mode1 text-[10px] font-medium">
            {error}
          </span>
        </div>
      )}
    </div>
  )
}
