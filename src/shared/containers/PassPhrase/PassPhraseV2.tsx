import { useEffect, useRef, useState } from 'react'

import { selectOrdinal, t } from '@lingui/core/macro'
import {
  DEFAULT_SELECTED_TYPE,
  PASSPHRASE_WORD_COUNTS,
  VALID_WORD_COUNTS
} from '@tetherto/pearpass-lib-constants'
import {
  Button,
  FieldError,
  InputField,
  Radio,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy, ContentPaste } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useToast } from '../../context/ToastContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { usePasteFromClipboard } from '../../hooks/usePasteFromClipboard'

type PassPhraseV2Props = {
  error?: string
  isCreateOrEdit?: boolean
  onChange?: (value: string) => void
  value?: string
}

const parsePassphraseText = (text: string): string[] =>
  text
    .trim()
    .split(/[-\s]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

const isValidRange = (wordCount: number): boolean =>
  !wordCount || (VALID_WORD_COUNTS as number[]).includes(wordCount)

const getSelectedTypeForWords = (wordCount: number): number => {
  if (
    wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_24 ||
    wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_24
  ) {
    return PASSPHRASE_WORD_COUNTS.STANDARD_24
  }
  if (
    wordCount === PASSPHRASE_WORD_COUNTS.STANDARD_12 ||
    wordCount === PASSPHRASE_WORD_COUNTS.WITH_RANDOM_12
  ) {
    return PASSPHRASE_WORD_COUNTS.STANDARD_12
  }
  return DEFAULT_SELECTED_TYPE
}

export const PassPhraseV2 = ({
  error,
  isCreateOrEdit = false,
  onChange,
  value = ''
}: PassPhraseV2Props) => {
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()
  const { pasteFromClipboard } = usePasteFromClipboard()
  const { setToast } = useToast()
  const lastCommittedValueRef = useRef(value)

  const initialWords = parsePassphraseText(value)

  const [selectedType, setSelectedType] = useState<number>(
    getSelectedTypeForWords(initialWords.length)
  )
  const [passphraseWords, setPassphraseWords] = useState<string[]>(initialWords)

  const detectAndUpdateSettings = (words: string[]) => {
    setSelectedType(getSelectedTypeForWords(words.length))
  }

  useEffect(() => {
    if (value === lastCommittedValueRef.current) return
    if (!value?.trim().length) {
      setPassphraseWords([])
      lastCommittedValueRef.current = value
      return
    }
    const words = parsePassphraseText(value)
    setPassphraseWords(words)
    detectAndUpdateSettings(words)
    lastCommittedValueRef.current = value
  }, [value])

  const handlePasteFromClipboard = async () => {
    const pastedText = await pasteFromClipboard()
    if (!pastedText) return

    const words = parsePassphraseText(pastedText)

    if (!isValidRange(words.length)) {
      setToast({ message: t`Only 12 or 24 words are allowed`, icon: null })
      return
    }

    setPassphraseWords(words)
    detectAndUpdateSettings(words)
    lastCommittedValueRef.current = pastedText
    onChange?.(pastedText)
  }

  const expandedWords = Array.from(
    { length: Math.max(selectedType, passphraseWords.length || selectedType) },
    (_, index) => passphraseWords[index] ?? ''
  )

  const handleWordChange = (index: number, nextValue: string) => {
    const sanitized = nextValue.replace(/\s+/g, '').trim()
    const nextWords = [...expandedWords]
    nextWords[index] = sanitized
    setPassphraseWords(nextWords)

    const serialized = nextWords.filter(Boolean).join(' ')
    lastCommittedValueRef.current = serialized
    onChange?.(serialized)
  }

  const handleTypeSelect = (wordCount: number) => {
    setSelectedType(wordCount)

    if (passphraseWords.length > wordCount) {
      const nextWords = passphraseWords.slice(0, wordCount)
      setPassphraseWords(nextWords)
      const serialized = nextWords.filter(Boolean).join(' ')
      lastCommittedValueRef.current = serialized
      onChange?.(serialized)
    }
  }

  const optionsToRender = isCreateOrEdit
    ? [PASSPHRASE_WORD_COUNTS.STANDARD_12, PASSPHRASE_WORD_COUNTS.STANDARD_24]
    : [selectedType]
  const detailWords = passphraseWords.length
    ? passphraseWords
    : parsePassphraseText(value)

  const groupBorderColor = error
    ? theme.colors.colorSurfaceDestructiveElevated
    : theme.colors.colorBorderPrimary

  return (
    <div className="flex w-full flex-col gap-[var(--spacing12)]">
      <div
        className="bg-surface-primary overflow-hidden rounded-[var(--radius8)] border"
        style={{ borderColor: groupBorderColor }}
      >
        {!isCreateOrEdit ? (
          <div className="flex flex-col gap-[var(--spacing12)] p-[var(--spacing12)]">
            <div className="flex items-center justify-between">
              <Text variant="caption">{t`Recovery Phrase`}</Text>
              <Button
                variant="tertiary"
                size="small"
                type="button"
                aria-label={t`Copy recovery phrase`}
                iconBefore={
                  <ContentCopy
                    width={16}
                    height={16}
                    color={theme.colors.colorTextPrimary}
                  />
                }
                onClick={() => copyToClipboard(value)}
                data-testid="passphrase-details-copy"
              />
            </div>
            <div className="grid grid-cols-3 gap-[var(--spacing12)]">
              {detailWords.map((word, inputIndex) => (
                <InputField
                  key={`details-word-${inputIndex}`}
                  label={selectOrdinal(inputIndex + 1, {
                    one: '#st Word',
                    two: '#nd Word',
                    few: '#rd Word',
                    other: '#th Word'
                  })}
                  value={word}
                  placeholder={t`Enter Word`}
                  readOnly
                  testID={`passphrase-word-input-${inputIndex}`}
                />
              ))}
            </div>
          </div>
        ) : (
          optionsToRender.map((wordCount, index) => {
            const isSelected = selectedType === wordCount
            const description = t`Paste or enter ${wordCount} words. Optional +1 works only when pasted`
            const borderTopClass =
              index > 0 ? 'border-t border-border-primary' : ''

            return (
              <div
                key={wordCount}
                className={`flex flex-col gap-[var(--spacing12)] p-[var(--spacing12)] ${borderTopClass}`}
              >
                <div className="flex flex-row items-start gap-[var(--spacing12)]">
                  <div className="flex-1">
                    <Radio
                      builtIn
                      options={[
                        {
                          value: String(wordCount),
                          label: `${wordCount} Words`,
                          description
                        }
                      ]}
                      value={isSelected ? String(wordCount) : undefined}
                      onChange={
                        isCreateOrEdit
                          ? () => handleTypeSelect(wordCount)
                          : undefined
                      }
                      disabled={!isCreateOrEdit}
                    />
                  </div>

                  <Button
                    variant="tertiary"
                    size="small"
                    type="button"
                    aria-label={
                      isCreateOrEdit
                        ? t`Paste recovery phrase`
                        : t`Copy recovery phrase`
                    }
                    iconBefore={
                      isCreateOrEdit ? (
                        <ContentPaste
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      ) : (
                        <ContentCopy
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      )
                    }
                    onClick={() => {
                      if (isCreateOrEdit) {
                        handleTypeSelect(wordCount)
                        void handlePasteFromClipboard()
                        return
                      }
                      copyToClipboard(value)
                    }}
                    data-testid={`passphrase-${wordCount}-${isCreateOrEdit ? 'paste' : 'copy'}`}
                  />
                </div>

                {isSelected ? (
                  <div className="grid grid-cols-3 gap-[var(--spacing12)]">
                    {expandedWords.map((word, inputIndex) => (
                      <InputField
                        key={`${wordCount}-${inputIndex}`}
                        label={selectOrdinal(inputIndex + 1, {
                          one: '#st Word',
                          two: '#nd Word',
                          few: '#rd Word',
                          other: '#th Word'
                        })}
                        value={word}
                        placeholder={t`Enter Word`}
                        onChange={(e) =>
                          handleWordChange(inputIndex, e.target.value)
                        }
                        readOnly={!isCreateOrEdit}
                        testID={`passphrase-word-input-${inputIndex}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      {error?.length ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}
