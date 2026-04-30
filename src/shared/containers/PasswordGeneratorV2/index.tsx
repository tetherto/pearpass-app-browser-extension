import { useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  generatePassphrase,
  generatePassword
} from '@tetherto/pearpass-utils-password-generator'
import {
  checkPassphraseStrength,
  checkPasswordStrength
} from '@tetherto/pearpass-utils-password-check'
import {
  PasswordIndicator,
  type PasswordIndicatorVariant,
  Radio,
  Slider,
  Text,
  Title,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'

const MODE_MEMORABLE = 'memorable'
const MODE_RANDOM = 'random'

type Mode = typeof MODE_MEMORABLE | typeof MODE_RANDOM

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

export type PasswordGeneratorV2Props = {
  /**
   * Fired whenever the generated value changes (mode/length/settings tweak).
   * Consumers (Dialog wrapper, iframe wrapper) subscribe to read the latest
   * value when their primary action button fires.
   */
  onGeneratedChange?: (value: string) => void
}

/**
 * Chrome-less, context-agnostic body for the v2 password generator. Renders
 * three sections (Generated Password card with mode radios, Password Length
 * card with slider, Password settings card with toggles). Consumers provide
 * the outer card / dialog header / footer buttons.
 */
export const PasswordGeneratorV2 = ({
  onGeneratedChange
}: PasswordGeneratorV2Props) => {
  const { theme } = useTheme()

  const [mode, setMode] = useState<Mode>(MODE_RANDOM)
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

  useEffect(() => {
    onGeneratedChange?.(generated)
  }, [generated, onGeneratedChange])

  const strength = useMemo(() => {
    if (mode === MODE_MEMORABLE) {
      return checkPassphraseStrength(generated.split('-'))
    }
    return checkPasswordStrength(generated)
  }, [generated, mode])

  const indicatorVariant: PasswordIndicatorVariant =
    STRENGTH_TO_INDICATOR[strength.type] ?? 'vulnerable'

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

  const modeOptions: { key: Mode; label: string; description: string }[] = [
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

  const memorableSettings = [
    {
      key: 'all',
      label: t`Select all`,
      checked: allMemorableTogglesOn,
      onChange: (next: boolean) => setAllMemorableToggles(next)
    },
    {
      key: 'capitalLetters',
      label: t`Capital letters`,
      checked: memorable.capitalLetters,
      onChange: (next: boolean) =>
        setMemorable((r) => ({ ...r, capitalLetters: next }))
    },
    {
      key: 'symbols',
      label: t`Symbols`,
      checked: memorable.symbols,
      onChange: (next: boolean) =>
        setMemorable((r) => ({ ...r, symbols: next }))
    },
    {
      key: 'numbers',
      label: t`Numbers`,
      checked: memorable.numbers,
      onChange: (next: boolean) =>
        setMemorable((r) => ({ ...r, numbers: next }))
    }
  ]

  return (
    <div className="flex flex-col gap-[var(--spacing16)]">
      <section className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Generated Password`}
        </Text>

        <div className="border-border-primary flex flex-col overflow-hidden rounded-[var(--radius8)] border">
          <div className="border-border-primary flex flex-col items-center gap-[var(--spacing16)] border-b px-[var(--spacing16)] py-[var(--spacing24)]">
            <div className="w-full min-w-0 text-center break-words">
              <Title as="h3">
                {renderHighlightedPassword(
                  generated,
                  theme.colors.colorPrimary,
                  theme.colors.colorTextSecondary
                )}
              </Title>
            </div>
            <PasswordIndicator variant={indicatorVariant} />
          </div>

          {modeOptions.map((option, index) => (
            // Outer div is a styling container (padding + divider). The
            // inner Radio is the only accessible control — its built-in
            // keyboard handling drives the selection. The div onClick just
            // extends the visual hit area; clicking it bubbles into
            // Radio.onChange (calls below) so behavior stays single-source.
            <div
              key={option.key}
              className={[
                'cursor-pointer p-[var(--spacing12)]',
                index < modeOptions.length - 1
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
      </section>

      <section className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Password Length`}
        </Text>

        <div className="border-border-primary flex min-h-[41px] items-center justify-between gap-[var(--spacing12)] rounded-[var(--radius8)] border px-[var(--spacing12)] py-[var(--spacing8)]">
          <Text as="span" variant="labelEmphasized">
            {mode === MODE_MEMORABLE
              ? `${memorable.words} ${t`Words`}`
              : `${random.characters} ${t`Chars`}`}
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
              thumbTintColor={theme.colors.colorPrimary}
              aria-label={
                mode === MODE_MEMORABLE
                  ? t`Password length in words`
                  : t`Password length in characters`
              }
              maximumTrackTintColor={theme.colors.colorBorderPrimary}
              minimumTrackTintColor={theme.colors.colorPrimary}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Password settings`}
        </Text>

        <div className="border-border-primary flex flex-col overflow-hidden rounded-[var(--radius8)] border">
          {mode === MODE_MEMORABLE ? (
            memorableSettings.map((setting, index) => (
              <div
                key={setting.key}
                className={[
                  'flex items-center justify-between px-[var(--spacing16)] py-[var(--spacing12)]',
                  index < memorableSettings.length - 1
                    ? 'border-border-primary border-b'
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Text variant="bodyEmphasized">{setting.label}</Text>
                <ToggleSwitch
                  checked={setting.checked}
                  onChange={setting.onChange}
                  aria-label={setting.label}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between px-[var(--spacing16)] py-[var(--spacing12)]">
              <Text variant="bodyEmphasized">{t`Special character (!&*)`}</Text>
              <ToggleSwitch
                checked={random.specialCharacters}
                onChange={(next) =>
                  setRandom((r) => ({ ...r, specialCharacters: next }))
                }
                aria-label={t`Special character (!&*)`}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
