import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent
} from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
  generatePassphrase,
  generatePassword
} from '@tetherto/pearpass-utils-password-generator'
import {
  checkPassphraseStrength,
  checkPasswordStrength
} from '@tetherto/pearpass-utils-password-check'
import {
  Button,
  ListItem,
  PasswordIndicator,
  type PasswordIndicatorVariant,
  Radio,
  Slider,
  Text,
  Title,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { useRecords, useVault } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../../shared/context/RouterContext'
import { closeIframe } from '../../iframeApi/closeIframe'

const MODE_MEMORABLE = 'memorable'
const MODE_RANDOM = 'random'

const STRENGTH_TO_INDICATOR: Record<string, PasswordIndicatorVariant> = {
  vulnerable: 'vulnerable',
  weak: 'decent',
  safe: 'strong'
}

const renderHighlightedPassword = (
  text: string,
  primaryColor: string,
  secondaryColor: string
) => {
  const parts = text.split(/(\d+|[^a-zA-Z\d\s])/g)

  return parts.map((part, index) => {
    if (!part) return null

    if (/^\d+$/.test(part)) {
      return (
        <Text
          key={`${part}-${index}`}
          color={primaryColor}
          variant="bodyEmphasized"
        >
          {part}
        </Text>
      )
    }

    if (/[^a-zA-Z\d\s]/.test(part)) {
      return (
        <Text
          key={`${part}-${index}`}
          color={secondaryColor}
          variant="bodyEmphasized"
        >
          {part}
        </Text>
      )
    }

    return (
      <Text key={`${part}-${index}`} variant="bodyEmphasized">
        {part}
      </Text>
    )
  })
}

export const PasswordGeneratorV2 = () => {
  const popupRef = useRef<HTMLDivElement>(null)
  const { state: routerState } = useRouter()
  const { theme } = useTheme()
  const { refetch: refetchVault } = useVault()
  const { data: recordsData } = useRecords({
    variables: {
      filters: {
        type: routerState?.recordType
      }
    }
  })

  const [mode, setMode] = useState(MODE_RANDOM)
  const [memorable, setMemorable] = useState({
    words: 8,
    capitalLetters: true,
    symbols: true,
    numbers: true
  })
  const [random, setRandom] = useState({
    characters: 8,
    specialCharacters: true
  })

  const generated = useMemo(() => {
    if (mode === MODE_MEMORABLE) {
      return generatePassphrase(
        memorable.capitalLetters,
        memorable.symbols,
        memorable.numbers,
        memorable.words
      ).join('-')
    }
    return generatePassword(random.characters, {
      includeSpecialChars: random.specialCharacters,
      lowerCase: true,
      upperCase: true,
      numbers: true
    })
  }, [mode, memorable, random])

  const strength = useMemo(() => {
    if (mode === MODE_MEMORABLE) {
      return checkPassphraseStrength(generated.split('-'))
    }
    return checkPasswordStrength(generated)
  }, [generated, mode])

  const indicatorVariant: PasswordIndicatorVariant =
    STRENGTH_TO_INDICATOR[strength.type] ?? 'vulnerable'

  const onPasswordInsert = (value: string) => {
    window.parent.postMessage(
      {
        type: 'insertPassword',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          password: value
        }
      },
      '*'
    )
  }

  const onDiscard = () => {
    closeIframe({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType
    })
  }

  useLayoutEffect(() => {
    const el = popupRef.current
    window.parent.postMessage(
      {
        type: 'setStyles',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          style: {
            width: `${el?.offsetWidth ?? 440}px`,
            height: `${el?.offsetHeight ?? 280}px`,
            borderRadius: '12px'
          }
        }
      },
      '*'
    )
  }, [mode, memorable, random, routerState?.iframeId, routerState?.iframeType])

  useEffect(() => {
    void refetchVault()
  }, [recordsData?.length])

  const primary = theme.colors.colorPrimary
  const trackMax = theme.colors.colorBorderPrimary

  const allMemorableTogglesOn =
    memorable.capitalLetters && memorable.symbols && memorable.numbers

  const setAllMemorableToggles = (on: boolean) => {
    setMemorable((r) => ({
      ...r,
      capitalLetters: on,
      symbols: on,
      numbers: on
    }))
  }

  const stopRowClickFromToggle = (e: MouseEvent) => {
    e.stopPropagation()
  }

  const radioOptions = [
    {
      key: MODE_MEMORABLE,
      label: t`Memorable Password`,
      description: t`Memorable password using random words, numbers, and symbols.`
    },
    {
      key: MODE_RANDOM,
      label: t`Random Characters`,
      description: t`A fully random mix of letters, numbers, and symbols.`
    }
  ]

  return (
    <div
      className="border-border-primary bg-surface-primary flex w-[440px] flex-col overflow-hidden rounded-[12px] border"
      ref={popupRef}
    >
      <div className="border-border-primary flex shrink-0 items-center border-b px-[var(--spacing16)] py-[var(--spacing12)]">
        <Text color={theme.colors.colorTextPrimary} variant="label">
          <Trans>New Password Item</Trans>
        </Text>
      </div>
      <div className="max-h-[191px] min-h-0 flex-1 overflow-y-auto p-[var(--spacing16)]">
        <div className="pb-[var(--spacing12)]">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            <Trans>Generated Password</Trans>
          </Text>
        </div>
        <div className="border-border-primary mb-[var(--spacing24)] flex flex-col overflow-hidden rounded-[12px] border py-[var(--spacing24)]">
          <div className="border-border-primary flex flex-col items-center gap-[var(--spacing16)] border-b pb-[var(--spacing24)]">
            <div className="w-full min-w-0 text-center break-words">
              <Title as="h3">
                {renderHighlightedPassword(
                  generated,
                  primary,
                  theme.colors.colorTextSecondary
                )}
              </Title>
            </div>
            <PasswordIndicator variant={indicatorVariant} />
          </div>
          <div>
            {radioOptions.map((option, index) => (
              <div
                key={option.key}
                className={[
                  'cursor-pointer p-[12px]',
                  index < radioOptions.length - 1
                    ? 'border-border-primary border-b'
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setMode(option.key)}
              >
                <Radio
                  builtIn
                  options={[
                    {
                      value: option.key,
                      label: option.label,
                      description: option.description
                    }
                  ]}
                  value={mode === option.key ? option.key : undefined}
                  onChange={() => setMode(option.key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pb-[var(--spacing12)]">
          <Text color={theme.colors.colorTextSecondary} variant="caption">
            <Trans>Password Length</Trans>
          </Text>
        </div>
        <div className="border-border-primary mb-[var(--spacing24)] flex min-h-[41px] items-center justify-between gap-3 rounded-[12px] border px-3 py-2">
          <Text as="span" variant="labelEmphasized">
            {mode === MODE_MEMORABLE ? (
              <>
                {memorable.words} <Trans>Words</Trans>
              </>
            ) : (
              <>
                {random.characters} <Trans>Chars</Trans>
              </>
            )}
          </Text>
          <div className="ms-1 min-w-0 flex-1">
            <Slider
              minimumValue={mode === MODE_MEMORABLE ? 6 : 4}
              maximumValue={mode === MODE_MEMORABLE ? 36 : 32}
              step={1}
              value={
                mode === MODE_MEMORABLE ? memorable.words : random.characters
              }
              onValueChange={(value: number) => {
                if (mode === MODE_MEMORABLE) {
                  setMemorable((r) => ({ ...r, words: Math.round(value) }))
                  return
                }
                setRandom((r) => ({
                  ...r,
                  characters: Math.round(value)
                }))
              }}
              thumbTintColor={primary}
              aria-label={
                mode === MODE_MEMORABLE
                  ? t`Password length in words`
                  : t`Password length in characters`
              }
              maximumTrackTintColor={trackMax}
              minimumTrackTintColor={primary}
            />
          </div>
        </div>

        {mode === MODE_MEMORABLE && (
          <>
            <div className="pb-[var(--spacing12)]">
              <Text color={theme.colors.colorTextSecondary} variant="caption">
                <Trans>Password settings</Trans>
              </Text>
            </div>
            <div className="border-border-primary mb-2 overflow-hidden rounded-[12px] border">
              <ListItem
                rightElement={
                  <div
                    onClick={stopRowClickFromToggle}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                    }}
                    role="presentation"
                  >
                    <ToggleSwitch
                      aria-label={t`Select all password options`}
                      checked={allMemorableTogglesOn}
                      onChange={(c) => {
                        setAllMemorableToggles(c)
                      }}
                    />
                  </div>
                }
                selectable={false}
                showDivider
                title={t`Select all`}
                withRoundedBottomBorders={false}
              />
              <ListItem
                rightElement={
                  <div
                    onClick={stopRowClickFromToggle}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                    }}
                    role="presentation"
                  >
                    <ToggleSwitch
                      aria-label={t`Capital letters`}
                      checked={memorable.capitalLetters}
                      onChange={(c) => {
                        setMemorable((r) => ({
                          ...r,
                          capitalLetters: c
                        }))
                      }}
                    />
                  </div>
                }
                selectable={false}
                showDivider
                title={t`Capital letters`}
                withRoundedBottomBorders={false}
              />
              <ListItem
                rightElement={
                  <div
                    onClick={stopRowClickFromToggle}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                    }}
                    role="presentation"
                  >
                    <ToggleSwitch
                      aria-label={t`Symbols`}
                      checked={memorable.symbols}
                      onChange={(c) => {
                        setMemorable((r) => ({ ...r, symbols: c }))
                      }}
                    />
                  </div>
                }
                selectable={false}
                showDivider
                title={t`Symbols`}
                withRoundedBottomBorders={false}
              />
              <ListItem
                rightElement={
                  <div
                    onClick={stopRowClickFromToggle}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                    }}
                    role="presentation"
                  >
                    <ToggleSwitch
                      aria-label={t`Numbers`}
                      checked={memorable.numbers}
                      onChange={(c) => {
                        setMemorable((r) => ({ ...r, numbers: c }))
                      }}
                    />
                  </div>
                }
                selectable={false}
                title={t`Numbers`}
                withRoundedBottomBorders
              />
            </div>
          </>
        )}

        {mode === MODE_RANDOM && (
          <>
            <div className="pb-[var(--spacing12)]">
              <Text color={theme.colors.colorTextSecondary} variant="caption">
                <Trans>Password settings</Trans>
              </Text>
            </div>
            <div className="border-border-primary mb-2 overflow-hidden rounded-[12px] border">
              <ListItem
                rightElement={
                  <div
                    onClick={stopRowClickFromToggle}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                    }}
                    role="presentation"
                  >
                    <ToggleSwitch
                      aria-label={t`Special character (!&*)`}
                      checked={random.specialCharacters}
                      onChange={(c) => {
                        setRandom((r) => ({
                          ...r,
                          specialCharacters: c
                        }))
                      }}
                    />
                  </div>
                }
                selectable={false}
                title={t`Special character (!&*)`}
                withRoundedBottomBorders
              />
            </div>
          </>
        )}
      </div>

      <div className="border-border-primary flex shrink-0 justify-end gap-[var(--spacing8)] border-t px-[var(--spacing16)] py-[var(--spacing12)]">
        <Button
          onClick={onDiscard}
          size="small"
          type="button"
          variant="secondary"
          data-testid="generatepassword-button-discard-v2"
        >
          <Trans>Discard</Trans>
        </Button>
        <Button
          onClick={() => {
            onPasswordInsert(generated)
          }}
          size="small"
          type="button"
          variant="primary"
          data-testid="generatepassword-button-primary-v2"
        >
          <Trans>Use Password</Trans>
        </Button>
      </div>
    </div>
  )
}
